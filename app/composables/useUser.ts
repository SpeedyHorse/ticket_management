import type { Role, User } from "@prisma/client"

export const useUser = () => {
    const user = ref<User | null>(null)
    
    const getUserRole = async (): Promise<Role> => {
        const res: { data: { role: Role } } = await $fetch("/api/user/role")
        return res.data.role
    }

    const getUser = async (): Promise<User> => {
        const res: { data: { user: User } } = await $fetch("/api/user/me")
        return res.data.user
    }
    
    return {
        getUserRole,
        getUser
    }
}