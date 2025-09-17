import Joi from 'joi'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  venue: Joi.string().required(),
  price: Joi.number().min(0).required(),
  totalTickets: Joi.number().integer().min(1).required(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED').default('DRAFT')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = eventSchema.validate(body)
    
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    const newEvent = await prisma.event.create({
      data: {
        ...value,
        startDate: new Date(value.startDate).toISOString(),
        endDate: new Date(value.endDate).toISOString(),
        organizerId: event.context.user.id,
        availableTickets: value.totalTickets
      }
    })

    return {
      success: true,
      event: newEvent,
      message: 'イベントを作成しました'
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error(error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの作成に失敗しました'
    })
  }
})