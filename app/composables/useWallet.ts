interface CreateWalletResponse {
    data: {
        user: {
            id: string
            walletAddress: string
            walletCreated: boolean
        }
    } | null
    error: string | null
}

export const useWallet = () => {
    const createWallet = async (password: string) => {
        const res: CreateWalletResponse = await $fetch(
            '/api/wallet/create',
            {
                method: 'POST',
                body: {
                    password: password
                }
            }
        )
        if (res.error) {
            throw new Error(res.error)
        }
        return res.data?.user
    }

    const getWalletStatus = async (): Promise<boolean> => {
        const res: { created: boolean } = await $fetch('/api/wallet/status')
        return res.created
    }

    return {
        createWallet,
        getWalletStatus
    }
}