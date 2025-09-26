import { getEvents } from "@@/lib/db/event"


export default defineEventHandler(async (event) => {
    const events = await getEvents()
    return {
        data: events
    }
})