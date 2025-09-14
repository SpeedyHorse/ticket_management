import { getServerSession } from "#auth";
import { findUserByEmail } from "@@/lib/db/user";
import { createWallet } from "@@/lib/db/wallet";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session || !session.user?.email) {
        event.node.res.statusCode = 401
        return { data: null, error: "Unauthorized" }
    }

    const user = await findUserByEmail(session.user.email)
    if (!user) {
        event.node.res.statusCode = 401
        return { data: null, error: "Unauthorized" }
    }

    const body = await readBody(event)
    const password = body.password
    if (!password) {
        event.node.res.statusCode = 422
        return { data: null, error: "Password is required" }
    }

    const wallet = await createWallet(user.id, password)
    if (!wallet) {
        event.node.res.statusCode = 500
        return { data: null, error: "Failed to create wallet" }
    }
    return {
        data: {
            user: {
                id: wallet.id,
                walletAddress: wallet.walletAddress,
                walletCreated: wallet.walletCreated
            }
        }
    }
})