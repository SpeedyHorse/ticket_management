import Joi from 'joi'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

const answerSchema = Joi.object({
  ticketId: Joi.string().required(),
  answers: Joi.array().items(Joi.object({
    questionId: Joi.string().required(),
    answer: Joi.string().required()
  })).required()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = answerSchema.validate(body)
    
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    const { ticketId, answers } = value
    console.log(ticketId, answers)

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

    // 回答をランダムに２つ選択
    const randomAnswers = answers.sort(() => Math.random() - 0.5).slice(0, 2)

    const selectedQuestionIds = randomAnswers.map((answer: any) => answer.questionId).join(',')
    const selectedAnswers = randomAnswers.map((answer: any) => answer.answer).join(',')

    // チケットセキュリティを作成
    const updatedSession = await prisma.ticketSecurity.create({
      data: {
        ticketId,
        selectedQuestionIds,
        answersHash: selectedAnswers,
        zkProofHash: ''
      }
    })

    // 検証トークンを生成
    const verificationToken = createHash('sha256')
      .update(`${sessionId}-${JSON.stringify(hashedAnswers)}-${Date.now()}`)
      .digest('hex')

    return {
      success: true,
      verificationToken,
      sessionId,
      completedAt: updatedSession.completedAt,
      message: '回答を受け付けました'
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '回答の処理に失敗しました'
    })
  }
})