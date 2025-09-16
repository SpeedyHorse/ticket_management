import GithubProvider from 'next-auth/providers/github';
import { NuxtAuthHandler } from '#auth';
import { Provider } from '@prisma/client';
import { findUserByProvider, createUser, findUserByEmail } from '@@/lib/db/user';


async function signIn(info: any) {
    const providerAccountId = info.account?.providerAccountId;
    const provider = info.account?.provider == "github" ? Provider.GITHUB : Provider.GOOGLE;
    const account = await findUserByProvider(provider, providerAccountId)
    
    console.error("[server] signIn", account ? "true" : "false")
    if (account) {
        return true
    } else {
        const user = await createUser(
            info.user.name,
            info.user.email,
            provider,
            providerAccountId
        )
        return user ? true : false
    }
}


export default NuxtAuthHandler({
    secret: 'test',
    providers: [
        // @ts-expect-error
        GithubProvider.default({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            return signIn({user, account, profile, email, credentials})
        },
        async redirect({ url, baseUrl }) {
            return baseUrl
        },
        async session({ session, user, token }) {
            return session
        },
        async jwt({ token, user, account, profile }) {
            return token
        }
    }
})