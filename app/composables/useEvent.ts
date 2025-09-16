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

    return {
        createEvent,
        getEventsByOrganizerId
    }
}