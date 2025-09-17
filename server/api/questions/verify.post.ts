import Joi from 'joi'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

const verifySchema = Joi.object({
  ticketId: Joi.string().required(),
  verificationToken: Joi.string().required(),
  answers: Joi.array().items(Joi.object({
    questionId: Joi.string().required(),
    answer: Joi.string().required()
  })).required()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = verifySchema.validate(body)
    
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    const { ticketId, verificationToken, answers } = value

    // チケットの存在確認
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true }
    })

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: 'チケットが見つかりません'
      })
    }

    // 対応する質問セッションを検索
    const session = await prisma.questionSession.findFirst({
      where: {
        ticketId,
        status: 'COMPLETED'
      },
      orderBy: { completedAt: 'desc' }
    })

    if (!session) {
      throw createError({
        statusCode: 404,
        statusMessage: '完了した質問セッションが見つかりません'
      })
    }

    // 保存された回答ハッシュを取得
    const storedAnswers = JSON.parse(session.answers)
    
    // 提供された回答をハッシュ化
    const providedHashes = answers.map(answer => ({
      questionId: answer.questionId,
      answerHash: createHash('sha256').update(answer.answer.toLowerCase().trim()).digest('hex')
    }))

    // 回答の一致を確認
    let matchCount = 0
    for (const provided of providedHashes) {
      const stored = storedAnswers.find(s => s.questionId === provided.questionId)
      if (stored && stored.answerHash === provided.answerHash) {
        matchCount++
      }
    }

    const isVerified = matchCount === answers.length && answers.length === storedAnswers.length

    if (isVerified) {
      // チケットのステータスを更新
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { 
          status: 'VERIFIED',
          verifiedAt: new Date()
        }
      })
    }

    return {
      success: true,
      verified: isVerified,
      matchCount,
      totalQuestions: answers.length,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        event: ticket.event.title,
        status: isVerified ? 'VERIFIED' : ticket.status
      }
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '回答の検証に失敗しました'
    })
  }
})