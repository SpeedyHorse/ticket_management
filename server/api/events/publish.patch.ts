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
                statusMessage: "自分のイベントのみ公開できます"
            })
        }

        // 公開前のバリデーション
        if (existingEvent.status === EventStatus.PUBLISHED) {
            throw createError({
                statusCode: 400,
                statusMessage: "このイベントは既に公開されています"
            })
        }

        if (new Date(existingEvent.startDate) <= new Date()) {
            throw createError({
                statusCode: 400,
                statusMessage: "開始日時が過去のイベントは公開できません"
            })
        }

        const updatedEvent = await updateEventStatus(eventId, EventStatus.PUBLISHED)

        return {
            success: true,
            data: updatedEvent,
            message: "イベントを公開しました"
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "イベントの公開に失敗しました"
        })
    }
})