import { getPublishedEvents, getEventsByOrganizerId } from "@@/lib/db/event"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { organizerId, published } = query

    try {
        let events
        console.log("organizerId", organizerId)
        console.log("published", published)

        if (organizerId) {
            // Get events by organizer (for admin dashboard)
            events = await getEventsByOrganizerId(organizerId as string)
        } else if (published === 'true') {
            // Get only published events (for public listing)
            events = await getPublishedEvents()
        } else {
            // Get all events (admin only)
            events = await getPublishedEvents() // Default to published for security
        }

        return {
            success: true,
            data: events
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "Failed to fetch events"
        })
    }
})