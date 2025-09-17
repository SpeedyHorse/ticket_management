import { createEvent } from "@@/lib/db/event"
import { createEventSchema, validateEventData } from "@@/lib/validation/event"

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        // バリデーション実行
        const validatedData = validateEventData(body, createEventSchema)

        const result_event = await createEvent({
            ...validatedData,
            organizerId: event.context.user.id
        })

        return {
            success: true,
            data: result_event
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "イベントの作成に失敗しました"
        })
    }
})