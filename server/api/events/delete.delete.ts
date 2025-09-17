import { deleteEvent, getEvent } from "@@/lib/db/event"

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
                statusMessage: "自分のイベントのみ削除できます"
            })
        }

        await deleteEvent(eventId)

        return {
            success: true,
            message: "イベントが正常に削除されました"
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "イベントの削除に失敗しました"
        })
    }
})