<script setup lang="ts">
import { useAuth } from '#imports';
const { signIn, status, signOut, data } = useAuth()
const { getWalletStatus } = useWallet()
const walletStatus = ref(true)

onMounted(async () => {
    walletStatus.value = await getWalletStatus()
})
</script>

<template>
    <div>
        <p>hello</p>
        <div>
            <NuxtLink to="/protected">protected</NuxtLink>
        </div>
        <div v-if="status == 'authenticated'">
            <p>hello, {{data?.user?.name}}</p>
            <button @click="() => signOut()">
                sign out
            </button>
        </div>
        <button v-else @click="() => signIn('github')">
            Sign In
        </button>
        <button v-if="!walletStatus" @click="() => navigateTo('/createwallet')">
            create wallet
        </button>
        <button @click="() => navigateTo('/dashboard')">
            dashboard
        </button>
    </div>
</template>