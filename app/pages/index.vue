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
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-2xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-8">チケット管理システム</h1>
            
            <div class="space-y-6">
                <p class="text-lg text-gray-600">hello</p>
                
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <NuxtLink 
                        to="/protected" 
                        class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        protected
                    </NuxtLink>
                </div>
                
                <div v-if="status == 'authenticated'" class="bg-white rounded-lg shadow-sm p-4">
                    <p class="text-gray-700 mb-3">hello, {{data?.user?.name}}</p>
                    <button 
                        @click="() => signOut()"
                        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        sign out
                    </button>
                </div>
                
                <button 
                    v-else 
                    @click="() => signIn('github')"
                    class="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                    Sign In
                </button>
                
                <button 
                    v-if="!walletStatus" 
                    @click="() => navigateTo('/createwallet')"
                    class="px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-medium mr-3"
                >
                    create wallet
                </button>
                
                <button 
                    @click="() => navigateTo('/dashboard')"
                    class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                >
                    dashboard
                </button>
            </div>
        </div>
    </div>
</template>