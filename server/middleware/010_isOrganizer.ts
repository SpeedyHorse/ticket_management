
import { Role } from "@prisma/client"

export default defineEventHandler(async (event) => {
    console.log("[server] 010 isOrganizer middleware")
    if (event.context.phase != 2) return

    if (event.context.user.role !== Role.ORGANIZER) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }
})