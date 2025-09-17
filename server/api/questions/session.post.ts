import Joi from 'joi'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

const sessionSchema = Joi.object({
  ticketId: Joi.string().required(),
  questions: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    question: Joi.string().required()
  })).required()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = sessionSchema.validate(body)
    
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    const { ticketId, questions } = value

    // チケットの存在確認
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: 'チケットが見つかりません'
      })
    }

    // 質問セッションを作成
    const sessionId = createHash('sha256')
      .update(`${ticketId}-${Date.now()}-${Math.random()}`)
      .digest('hex')

    const questionSession = await prisma.questionSession.create({
      data: {
        id: sessionId,
        ticketId,
        questions: JSON.stringify(questions),
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10分後に期限切れ
      }
    })

    return {
      success: true,
      sessionId,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question
      })),
      expiresAt: questionSession.expiresAt
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '質問セッションの作成に失敗しました'
    })
  }
})