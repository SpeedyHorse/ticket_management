import { updateEvent, getEvent } from "@@/lib/db/event"
import { updateEventSchema, validateEventData } from "@@/lib/validation/event"

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const query = getQuery(event)
        
        const eventId = query.id as string
        if (!eventId) {
            throw createError({
                statusCode: 400,
                statusMessage: "イベントIDが必要です"
            })
        }

        // バリデーション実行
        const validatedData = validateEventData(body, updateEventSchema)

        // Check if user owns this event
        const existingEvent = await getEvent(eventId)
        if (existingEvent.organizerId !== event.context.user.id) {
            throw createError({
                statusCode: 403,
                statusMessage: "自分のイベントのみ編集できます"
            })
        }

        const updatedEvent = await updateEvent(eventId, validatedData)

        return {
            success: true,
            data: updatedEvent
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "イベントの更新に失敗しました"
        })
    }
})