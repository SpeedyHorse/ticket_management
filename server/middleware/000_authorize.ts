import { getServerSession } from "#auth"
import { findUserByEmail } from "@@/lib/db/user"

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session || !session.user?.email) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    const user = await findUserByEmail(session.user.email)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    event.context.user = user
})