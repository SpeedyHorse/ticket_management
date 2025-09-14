import { Provider } from '@prisma/client';
import prisma from '../prisma';

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {
            email
        }
    })
}

export async function findUserByProvider(provider: Provider, providerId: string) {
    const account = prisma.account.findUnique({
        where: {
            provider_providerId: {
                provider,
                providerId
            }
        }
    })
    if (!account) {
        return null
    }
    return account.user
}

export async function createUser(name: string, email: string, provider: Provider, providerId: string) {
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