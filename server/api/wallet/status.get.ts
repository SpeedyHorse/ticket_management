import { getServerSession } from "#auth";
import { findUserByEmail } from "~~/lib/db/user";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session || !session.user?.email) {
        event.node.res.statusCode = 401
        return { created: false }
    }

    const user = await findUserByEmail(session.user.email)
    return { created: user!.walletCreated }
})