<template>
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4">QRコードスキャナー</h2>

    <!-- カメラ表示エリア -->
    <div class="mb-6">
      <div v-if="!cameraActive" class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <p class="text-gray-600 mb-4">カメラでQRコードをスキャンします</p>
        <button 
          @click="startCamera"
          :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <span v-if="loading">準備中...</span>
          <span v-else>カメラを開始</span>
        </button>
      </div>

      <div v-else class="relative">
        <video 
          ref="videoElement"
          autoplay
          playsinline
          class="w-full rounded-lg"
        ></video>
        
        <!-- スキャンエリアのオーバーレイ -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-48 h-48 border-2 border-white rounded-lg relative">
            <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
            <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
            <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
            <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
          </div>
        </div>

        <button 
          @click="stopCamera"
          class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 手動入力オプション -->
    <div class="mb-6">
      <div class="text-center mb-4">
        <span class="text-gray-500">または</span>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            QRコードデータを手動入力
          </label>
          <textarea 
            v-model="manualInput"
            rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="QRコードの内容を貼り付けてください"
          />
        </div>
        
        <button 
          @click="processManualInput"
          :disabled="!manualInput.trim() || processing"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          検証
        </button>
      </div>
    </div>

    <!-- スキャン結果 -->
    <div v-if="scanResult" class="mb-6">
      <div 
        :class="scanResult.verified ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'"
        class="p-4 border rounded-md"
      >
        <div class="flex items-center mb-2">
          <svg 
            v-if="scanResult.verified"
            class="w-5 h-5 text-green-600 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg 
            v-else
            class="w-5 h-5 text-red-600 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span 
            :class="scanResult.verified ? 'text-green-800' : 'text-red-800'"
            class="font-semibold"
          >
            {{ scanResult.verified ? '検証成功' : '検証失敗' }}
          </span>
        </div>
        
        <p 
          :class="scanResult.verified ? 'text-green-700' : 'text-red-700'"
          class="mb-3"
        >
          {{ scanResult.message }}
        </p>

        <div v-if="scanResult.ticket" class="text-sm space-y-1">
          <p><strong>チケット番号:</strong> {{ scanResult.ticket.ticketNumber }}</p>
          <p v-if="scanResult.ticket.event"><strong>イベント:</strong> {{ scanResult.ticket.event.title }}</p>
          <p v-if="scanResult.ticket.userEmail"><strong>購入者:</strong> {{ scanResult.ticket.userEmail }}</p>
          <p><strong>ステータス:</strong> {{ getStatusText(scanResult.ticket.status) }}</p>
        </div>

        <div v-if="scanResult.verified && !scanResult.ticket.status === 'USED'" class="mt-4">
          <button 
            @click="markAsUsed"
            :disabled="processing"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            入場処理を完了
          </button>
        </div>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mb-6 p-4 bg-red-100 border border-red-400 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- 処理中表示 -->
    <div v-if="processing" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p class="text-gray-600">処理中...</p>
    </div>
  </div>
</template>

<script setup>
import { BrowserQRCodeReader } from '@zxing/library'

const props = defineProps({
  eventId: String
})

const emit = defineEmits(['scan-result'])

const videoElement = ref(null)
const cameraActive = ref(false)
const loading = ref(false)
const processing = ref(false)
const error = ref('')
const scanResult = ref(null)
const manualInput = ref('')
const qrReader = ref(null)
const stream = ref(null)

const startCamera = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // カメラアクセス許可を要求
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment', // 背面カメラを優先
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    })
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream.value
      cameraActive.value = true
      
      // QRコードリーダーを初期化
      qrReader.value = new BrowserQRCodeReader()
      
      // QRコードスキャンを開始
      startScanning()
    }
    
  } catch (err) {
    error.value = 'カメラへのアクセスに失敗しました。ブラウザの設定を確認してください。'
    console.error('Camera error:', err)
  } finally {
    loading.value = false
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  
  if (qrReader.value) {
    qrReader.value.reset()
  }
  
  cameraActive.value = false
  scanResult.value = null
}

const startScanning = () => {
  if (!qrReader.value || !videoElement.value) return
  
  const scanFrame = () => {
    if (!cameraActive.value) return
    
    try {
      qrReader.value.decodeFromVideoDevice(undefined, videoElement.value, (result, error) => {
        if (result) {
          processQRCode(result.getText())
        }
        // エラーは無視（スキャン継続）
      })
    } catch (err) {
      console.error('Scan error:', err)
    }
  }
  
  // スキャンを開始
  scanFrame()
}

const processQRCode = async (qrData) => {
  if (processing.value) return
  
  processing.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/qr/verify', {
      method: 'POST',
      body: {
        qrData,
        eventId: props.eventId
      }
    })
    
    scanResult.value = response
    emit('scan-result', response)
    
    // 成功時はカメラを停止
    if (response.verified) {
      stopCamera()
    }
    
  } catch (err) {
    error.value = err.data?.message || 'QRコードの検証に失敗しました'
    scanResult.value = null
  } finally {
    processing.value = false
  }
}

const processManualInput = () => {
  if (manualInput.value.trim()) {
    processQRCode(manualInput.value.trim())
  }
}

const markAsUsed = async () => {
  if (!scanResult.value?.ticket?.id) return
  
  processing.value = true
  
  try {
    const response = await $fetch(`/api/tickets/${scanResult.value.ticket.id}/use`, {
      method: 'POST'
    })
    
    // 結果を更新
    scanResult.value.ticket.status = 'USED'
    scanResult.value.ticket.usedAt = response.ticket.usedAt
    scanResult.value.message = '入場処理が完了しました'
    
    emit('ticket-used', response.ticket)
    
  } catch (err) {
    error.value = err.data?.message || '入場処理に失敗しました'
  } finally {
    processing.value = false
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'PURCHASED': return '購入済み'
    case 'USED': return '使用済み'
    case 'CANCELLED': return 'キャンセル済み'
    case 'VERIFIED': return '検証済み'
    default: return status
  }
}

onUnmounted(() => {
  stopCamera()
})
</script>