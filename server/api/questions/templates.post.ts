import Joi from 'joi'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const templateSchema = Joi.object({
  question: Joi.string().required(),
  category: Joi.string().required(),
  isActive: Joi.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = templateSchema.validate(body)
    
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    const template = await prisma.questionTemplate.create({
      data: value
    })

    return {
      success: true,
      template,
      message: '質問テンプレートを作成しました'
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: '質問テンプレートの作成に失敗しました'
    })
  }
})