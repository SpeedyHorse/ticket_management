import { deleteEvent } from "@@/lib/db/event";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id } = body
    const result = await deleteEvent(id)
    return {
        data: result
    }
})