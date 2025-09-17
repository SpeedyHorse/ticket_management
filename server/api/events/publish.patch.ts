import { updateEventStatus, getEvent } from "@@/lib/db/event"
import { EventStatus } from "@prisma/client"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    
    const eventId = query.id as string
    if (!eventId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Event ID is required"
        })
    }

    // Check if user owns this event
    const existingEvent = await getEvent(eventId)
    if (existingEvent.organizerId !== event.context.user.id) {
        throw createError({
            statusCode: 403,
            statusMessage: "You can only publish your own events"
        })
    }

    try {
        const updatedEvent = await updateEventStatus(eventId, EventStatus.PUBLISHED)

        return {
            success: true,
            data: updatedEvent
        }
    } catch (error: any) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message
        })
    }
})