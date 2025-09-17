import { updateEvent, getEvent } from "@@/lib/db/event"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
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
            statusMessage: "You can only edit your own events"
        })
    }

    const {
        title,
        description,
        venue,
        startDate,
        endDate,
        price,
        totalTickets,
        status
    } = body

    try {
        const updatedEvent = await updateEvent(eventId, {
            title,
            description,
            venue,
            startDate,
            endDate,
            price,
            totalTickets,
            status
        })

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