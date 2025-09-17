import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const ticketId = getRouterParam(event, 'id')
    console.log("ticketId", ticketId)
    
    if (!ticketId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'チケットIDが必要です'
      })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            venue: true,
            price: true
          }
        }
      }
    })

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: 'チケットが見つかりません'
      })
    }

    return {
      data: ticket
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'チケット情報の取得に失敗しました'
    })
  }
})