import { User } from "@prisma/client"

export default defineEventHandler(async (event) => {
    // middlewar: auth
    const user = event.context.user as User
    return {
        data: {
            role: user.role
        }
    }
})