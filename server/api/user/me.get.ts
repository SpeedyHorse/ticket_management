import { User } from "@prisma/client"

export default defineEventHandler(async (event) => {
    const user = event.context.user as User
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    return {
        data: {
            user
        }
    }
})