import { getServerSession } from "#auth"
import { findUserByEmail } from "@@/lib/db/user"

export default defineEventHandler(async (event) => {
    console.log("[server] 001 authorize middleware")
    if (event.context.phase == 0) return

    console.log("[server] 001 authorize middleware : getServerSession")
    const session = await getServerSession(event)
    if (!session || !session.user?.email) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    console.log("[server] 001 authorize middleware : findUserByEmail")
    const user = await findUserByEmail(session.user.email)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    console.log("[server] 001 authorize middleware : set user")
    event.context.user = user
    console.log("[server] 001 authorize middleware : done")
})