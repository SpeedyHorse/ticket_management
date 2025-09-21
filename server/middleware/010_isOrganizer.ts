
import { Role } from "@prisma/client"

export default defineEventHandler(async (event) => {
    const permitRoles = [Role.ORGANIZER, Role.ADMIN]
    
    console.log("[server] 010 isOrganizer middleware")
    if (event.context.phase != 2) return

    if (!permitRoles.includes(event.context.user.role)) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }
})