export const useEvent = () => {
    const createEvent = async (event: any) => {
        const res = await $fetch(
            "/api/events/create",
            {
                method: "POST",
                body: event
            }
        )
        console.log("res", res)
        return res
    }

    const updateEvent = async (eventId: string, updates: any) => {
        const res = await $fetch(
            "/api/events/save",
            {
                method: "PUT",
                query: { id: eventId },
                body: updates
            }
        )
        return res
    }

    const deleteEvent = async (eventId: string) => {
        const res = await $fetch(
            "/api/events/delete",
            {
                method: "DELETE",
                query: { id: eventId }
            }
        )
        return res
    }

    const publishEvent = async (eventId: string) => {
        const res = await $fetch(
            "/api/events/publish",
            {
                method: "PATCH",
                query: { id: eventId }
            }
        )
        return res
    }

    const unpublishEvent = async (eventId: string) => {
        const res = await $fetch(
            "/api/events/unpublish",
            {
                method: "PATCH",
                query: { id: eventId }
            }
        )
        return res
    }

    const getEventsByOrganizerId = async (organizerId: string) => {
        const res: { data: Event[] } = await $fetch(
            "/api/events/info",
            {
                method: "GET",
                query: { organizerId }
            }
        )
        return res.data
    }

    const getEventById = async (eventId: string) => {
        const res: { data: Event[] } = await $fetch(
            "/api/events/info",
            {
                method: "GET",
                query: { id: eventId }
            }
        )
        return res.data[0]
    }

    const getAllEvents = async () => {
        const res: { data: Event[] } = await $fetch(
            "/api/events/info",
            {
                method: "GET"
            }
        )
        return res.data
    }

    return {
        createEvent,
        updateEvent,
        deleteEvent,
        publishEvent,
        unpublishEvent,
        getEventsByOrganizerId,
        getEventById,
        getAllEvents
    }
}