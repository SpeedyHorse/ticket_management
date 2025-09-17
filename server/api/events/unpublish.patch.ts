import { updateEventStatus, getEvent } from "@@/lib/db/event"
import { EventStatus } from "@prisma/client"

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        
        const eventId = query.id as string
        if (!eventId) {
            throw createError({
                statusCode: 400,
                statusMessage: "イベントIDが必要です"
            })
        }

        // Check if user owns this event
        const existingEvent = await getEvent(eventId)
        if (existingEvent.organizerId !== event.context.user.id) {
            throw createError({
                statusCode: 403,
                statusMessage: "自分のイベントのみ非公開にできます"
            })
        }

        // 非公開前のバリデーション
        if (existingEvent.status !== EventStatus.PUBLISHED) {
            throw createError({
                statusCode: 400,
                statusMessage: "公開中のイベントのみ非公開にできます"
            })
        }

        const updatedEvent = await updateEventStatus(eventId, EventStatus.DRAFT)

        return {
            success: true,
            data: updatedEvent,
            message: "イベントを非公開にしました"
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "イベントの非公開に失敗しました"
        })
    }
})