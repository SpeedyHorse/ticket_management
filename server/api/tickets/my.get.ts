import Joi from 'joi'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const querySchema = Joi.object({
    email: Joi.string().email().required()
})

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const { error, value } = querySchema.validate(query)
        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: error.details[0].message
            })
        }
        const { email } = value

        const tickets = await prisma.ticket.findMany({
            where: { userEmail: email },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        date: true,
                        location: true,
                        price: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
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