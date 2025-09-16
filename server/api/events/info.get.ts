import { getEventsByParams } from "@@/lib/db/event"
import { EventStatus } from "@prisma/client"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    
    const { id, organizerId, status } = query

    const params = {
        ...(id !== null && { id: id as string }),
        ...(organizerId !== null && { organizerId: organizerId as string }),
        ...(status !== null && { status: status as EventStatus }),
    }

    const events = await getEventsByParams(params)

    return { data: events }
})