import type { Role } from "@prisma/client"

export const useUser = () => {
    const getUserRole = async (): Promise<Role> => {
        const res: { data: { role: Role } } = await $fetch("/api/user/role")
        return res.data.role
    }
    
    return {
        getUserRole
    }
}