
import { Role } from "@prisma/client"

export default defineEventHandler(async (event) => {
    if (event.context.user.role !== Role.ORGANIZER) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }
})