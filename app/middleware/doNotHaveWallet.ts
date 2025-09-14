export default defineNuxtRouteMiddleware(async (to, from) => {
    const { status } = useAuth()
    if (status.value == "unauthenticated") {
        console.log("unauthenticated")
        return navigateTo("/")
    }

    const { getWalletStatus } = useWallet()
    
    const walletStatus = await getWalletStatus()

    if (walletStatus) {
        console.log("walletStatus", walletStatus)
        return navigateTo('/')
    }
})