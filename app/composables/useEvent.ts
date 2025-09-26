import type { Event } from "@prisma/client"

export const useEvent = () => {
    const createEvent = async (event: any) => {
        const res = await $fetch(
            "/api/events/create",
            {
                method: "POST",
                body: event
            }
        )
        return res
    }

    const getEvent = async (id: string): Promise<Event | undefined> => {
        const res: { data: Event[] } = await $fetch<{ data: Event[] }>(
            "/api/events/info",
            {
                method: "GET",
                query: { id }
            }
        )
        if (res.data.length !== 1) {
            return undefined
        } else {
            return res.data[0] as Event
        }
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
        const res: { data: Event[] } = await $fetch<{ data: Event[] }>(
            "/api/events/info",
            {
                method: "GET",
                query: { organizerId }
            }
        )
        return res.data
    }

    const getAllEvents = async () => {
        const res: { data: Event[] } = await $fetch<{ data: Event[] }>(
            "/api/events"
        )
        return res.data;
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
        deleteEvent,
        getAllEvents,
        getEvent
    }
}