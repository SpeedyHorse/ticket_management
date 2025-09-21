import { updateEvent } from "@@/lib/db/event"

export default defineEventHandler(async (input_event) => {
    const body = await readBody(input_event)
    const { id, event } = body
    const result = await updateEvent(id, event)
    return {
        data: result
    }
})