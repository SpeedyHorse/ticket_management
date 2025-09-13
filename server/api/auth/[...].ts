import GithubProvider from 'next-auth/providers/github';
import { NuxtAuthHandler } from '#auth';

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
            return true
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