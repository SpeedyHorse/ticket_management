import { getServerSession } from "#auth";
import { findUserByEmail } from "~~/lib/db/user";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session || !session.user?.email) {
        event.node.res.statusCode = 401
        return { data: { created: false }, error: "Unauthorized" }
    }

    const user = await findUserByEmail(session.user.email)
    return { data: { created: user!.walletCreated } }
})