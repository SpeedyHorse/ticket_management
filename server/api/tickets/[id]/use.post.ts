import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const ticketId = getRouterParam(event, 'id')
    
    if (!ticketId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'チケットIDが必要です'
      })
    }

    // チケット情報を取得
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

    // 既に使用済みかチェック
    if (ticket.status === 'USED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'このチケットは既に使用済みです'
      })
    }

    // キャンセル済みかチェック
    if (ticket.status === 'CANCELLED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'このチケットはキャンセルされています'
      })
    }

    // チケットを使用済みに更新
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'USED',
        usedAt: new Date()
      },
      include: { event: true }
    })

    return {
      success: true,
      message: 'チケットが使用されました',
      ticket: {
        id: updatedTicket.id,
        ticketNumber: updatedTicket.ticketNumber,
        status: updatedTicket.status,
        usedAt: updatedTicket.usedAt,
        event: {
          title: updatedTicket.event.title,
          startDate: updatedTicket.event.startDate,
          venue: updatedTicket.event.venue
        }
      }
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'チケットの使用処理に失敗しました'
    })
  }
})