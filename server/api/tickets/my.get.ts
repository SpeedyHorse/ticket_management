import Joi from 'joi'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const querySchema = Joi.object({
    email: Joi.string().email().required()
})

export default defineEventHandler(async (event) => {
    try {
        const id = event.context.user.id

        const tickets = await prisma.ticket.findMany({
            where: { userId: id },
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
            },
            orderBy: { purchaseDate: 'desc' }
        })

        return {
            success: true,
            tickets
        }

    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: 'チケット取得に失敗しました'
        })
    }
})