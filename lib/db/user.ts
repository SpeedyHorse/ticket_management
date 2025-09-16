import { Provider } from '@prisma/client';
import prisma from '../prisma';

export async function findUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: {
            email
        }
    })
}

export async function findUserByProvider(provider: Provider, providerId: string) {
    const account = await prisma.account.findUnique({
        where: {
            provider_providerId: {
                provider,
                providerId
            }
        }
    })
    console.error("[prisma] findUserByProvider", JSON.stringify(account))
    if (!account) {
        return null
    }
    const user = await prisma.user.findUnique({
        where: {
            id: account.userId
        }
    })
    console.error("[prisma] findUserByProvider", JSON.stringify(user))
    return user
}

export async function createUser(name: string, email: string, provider: Provider, providerId: string) {
    console.log("[prisma] createUser", name, email, provider, providerId)
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data : {
                name,
                email
            }
        })
        const account = await tx.account.create({
            data: {
                provider,
                providerId,
                userId: user.id,
                name
            }
        })
        return account ? user : null
    })
}