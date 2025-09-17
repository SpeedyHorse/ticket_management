import { deleteEvent, getEvent } from "@@/lib/db/event"

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
            statusMessage: "You can only delete your own events"
        })
    }

    try {
        await deleteEvent(eventId)

        return {
            success: true,
            message: "Event deleted successfully"
        }
    } catch (error: any) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message
        })
    }
})