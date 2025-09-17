import Joi from 'joi'
import { PrismaClient, TicketStatus } from '@prisma/client'
import { nanoid } from 'nanoid'
// import { generateQRCode, generateQRSignature, generateZKProofHash } from '~/utils/zk'

const prisma = new PrismaClient()

const purchaseSchema = Joi.object({
  eventId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(10).required(),
  userEmail: Joi.string().email().required()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = purchaseSchema.validate(body)
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }
    const { eventId, quantity, userEmail } = value

    // トランザクション内で在庫確認と購入処理
    const result = await prisma.$transaction(async (tx) => {
      // イベント情報と在庫確認
      const eventData = await tx.event.findUnique({
        where: { id: eventId },
        include: { _count: { select: { tickets: true } } }
      })

      if (!eventData) {
        throw createError({
          statusCode: 404,
          statusMessage: 'イベントが見つかりません'
        })
      }

      const availableTickets = eventData.totalTickets - eventData._count.tickets
      if (availableTickets < quantity) {
        throw createError({
          statusCode: 400,
          statusMessage: `在庫不足です。残り${availableTickets}枚`
        })
      }

      const user = await tx.user.findUnique({
        where: { email: userEmail }
      })
      if (!user) {
        throw createError({
          statusCode: 404,
          statusMessage: 'ユーザーが見つかりません'
        })
      }

      // チケット生成
      const tickets = []
      for (let i = 0; i < quantity; i++) {
        const ticket = await tx.ticket.create({
          data: {
            eventId,
            userId: user.id,
            ticketNumber: nanoid(),
            purchaseDate: new Date(),
            price: eventData.price,
            // qrCode: generateQRCode(),
            // qrSignature: generateQRSignature(),
            // zkProofHash: generateZKProofHash(),
            status: TicketStatus.VALID
          }
        })
        tickets.push(ticket)
      }

      return { tickets, event: eventData }
    })

    return {
      success: true,
      tickets: result.tickets,
      message: `${quantity}枚のチケットを購入しました`
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    console.error(error)
    
    throw createError({
      statusCode: 500,
      statusMessage: '購入処理中にエラーが発生しました'
    })
  }
})