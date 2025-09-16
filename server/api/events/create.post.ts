import { createEvent } from "@@/lib/db/event"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const {
        title,
        description,
        venue,
        startDate,
        endDate,
        price,
        totalTickets
    } = body

    const result_event = await createEvent({
        title,
        description,
        venue,
        startDate,
        endDate,
        price,
        totalTickets,
        organizerId: event.context.user.id
    })

    return {
        data: result_event
    }
})