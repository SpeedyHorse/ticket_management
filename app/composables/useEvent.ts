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

    const updateEvent = async (id: string, event: any) => {
        const res = await $fetch(
            "/api/events/save",
            {
                method: "PUT",
                body: { id, event }
            }
        )
        return res
    }

    const getEventsByOrganizerId = async (organizerId: string) => {
        const res: { data: any[] } = await $fetch<{ data: any[] }>(
            "/api/events/info",
            {
                method: "GET",
                query: { organizerId }
            }
        )
        return res.data
    }

    const deleteEvent = async (id: string) => {
        const res = await $fetch(
            "/api/events/delete",
            {
                method: "DELETE",
                body: { id }
            }
        )
        return res
    }

    return {
        createEvent,
        getEventsByOrganizerId,
        updateEvent,
        deleteEvent
    }
}