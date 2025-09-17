<template>
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4">ウォレット認証</h2>
    
    <div v-if="!isConnected" class="space-y-4">
      <p class="text-gray-600">Ethereumウォレットで認証してください</p>
      <button 
        @click="connectWallet"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        <span v-if="loading">接続中...</span>
        <span v-else>ウォレットを接続</span>
      </button>
    </div>

    <div v-else-if="isConnected && !isAuthenticated" class="space-y-4">
      <p class="text-gray-600">アドレス: {{ address }}</p>
      <button 
        @click="signMessage"
        :disabled="loading"
        class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        <span v-if="loading">署名中...</span>
        <span v-else>メッセージに署名</span>
      </button>
    </div>

    <div v-else class="space-y-4">
      <div class="p-4 bg-green-100 border border-green-400 rounded-md">
        <p class="text-green-700">認証完了</p>
        <p class="text-sm text-green-600">{{ address }}</p>
      </div>
      <button 
        @click="disconnect"
        class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
      >
        切断
      </button>
    </div>

    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'

const emit = defineEmits(['authenticated', 'disconnected'])

const isConnected = ref(false)
const isAuthenticated = ref(false)
const address = ref('')
const loading = ref(false)
const error = ref('')
const provider = ref(null)
const signer = ref(null)

const connectWallet = async () => {
  loading.value = true
  error.value = ''
  
  try {
    if (!window.ethereum) {
      throw new Error('MetaMaskがインストールされていません')
    }

    provider.value = new ethers.BrowserProvider(window.ethereum)
    await provider.value.send('eth_requestAccounts', [])
    
    signer.value = await provider.value.getSigner()
    address.value = await signer.value.getAddress()
    isConnected.value = true
    
  } catch (err) {
    error.value = err.message || 'ウォレット接続に失敗しました'
  } finally {
    loading.value = false
  }
}

const signMessage = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // ナンスを取得
    const nonceResponse = await $fetch('/api/auth/siwe/nonce')
    const nonce = nonceResponse.nonce

    // SIWEメッセージを作成
    const message = new SiweMessage({
      domain: window.location.host,
      address: address.value,
      statement: 'チケット管理システムにサインイン',
      uri: window.location.origin,
      version: '1',
      chainId: await provider.value.getNetwork().then(n => n.chainId),
      nonce,
      issuedAt: new Date().toISOString()
    })

    const messageString = message.prepareMessage()
    
    // メッセージに署名
    const signature = await signer.value.signMessage(messageString)
    
    // 署名を検証
    const verifyResponse = await $fetch('/api/auth/siwe/verify', {
      method: 'POST',
      body: {
        message: messageString,
        signature
      }
    })

    if (verifyResponse.success) {
      isAuthenticated.value = true
      emit('authenticated', {
        address: address.value,
        signature,
        message: messageString
      })
    }
    
  } catch (err) {
    error.value = err.data?.message || err.message || '署名に失敗しました'
  } finally {
    loading.value = false
  }
}

const disconnect = () => {
  isConnected.value = false
  isAuthenticated.value = false
  address.value = ''
  provider.value = null
  signer.value = null
  emit('disconnected')
}

onMounted(() => {
  // ウォレット接続状態をチェック
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet()
  }
})
</script>