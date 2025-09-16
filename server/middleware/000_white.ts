const whiteListPaths = [
    "/api/auth",
    "/api/events/info"
]

const authorizeListPaths = [
    "/api/wallet",
    "/api/user",
]

const roleListPaths = [
    "/api/events/create",
    "/api/events/delete",
]

export default defineEventHandler(async (event) => {
    console.log("event.path", event.path)
    console.log("[server] 000 white middleware")
    if (!event.path.startsWith("/api")) {
        event.context.phase = 0
        return
    }
    for (const whitePath of whiteListPaths) {
        if (event.path.startsWith(whitePath)) {
            event.context.phase = 0
            return
        }
    }
    for (const authorizePath of authorizeListPaths) {
        if (event.path.startsWith(authorizePath)) {
            event.context.phase = 1
            return
        }
    }
    for (const rolePath of roleListPaths) {
        if (event.path.startsWith(rolePath)) {
            event.context.phase = 2
            return
        }
    }
    event.context.phase = 0
    return

})