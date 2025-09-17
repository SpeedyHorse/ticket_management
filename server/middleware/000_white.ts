const whiteListPaths = [
    "/api/auth",
    "/api/events/info",
    "/api/events"
]

const authorizeListPaths = [
    "/api/wallet",
    "/api/user",
    "/api/tickets/purchase",
    "/api/tickets/my",
]

const roleListPaths = [
    "/api/admin/events/create",
    "/api/admin/events/delete",
    "/api/admin/events/publish",
    "/api/admin/events/unpublish",
    "/api/admin/events/save",
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