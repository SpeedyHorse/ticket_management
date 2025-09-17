<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">マイチケット</h1>

    <div v-if="loading" class="text-center py-8">
      <p>読み込み中...</p>
    </div>

    <div v-else-if="tickets.length === 0" class="text-center py-8">
      <p class="text-gray-600 mb-4">購入したチケットがありません</p>
      <NuxtLink 
        to="/events"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        イベントを探す
      </NuxtLink>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="ticket in tickets" 
        :key="ticket.id"
        class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
      >
        <div class="mb-4">
          <h3 class="text-lg font-semibold">{{ ticket.event.name }}</h3>
          <p class="text-gray-600">{{ formatDate(ticket.event.startDate) }}</p>
          <p class="text-gray-600">{{ ticket.event.venue }}</p>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500">チケット番号</p>
          <p class="font-mono text-sm">{{ ticket.ticketNumber }}</p>
        </div>

        <div class="mb-4">
          <span 
            :class="getStatusClass(ticket.status)"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ getStatusText(ticket.status) }}
          </span>
        </div>

        <div class="flex space-x-2">
          <button 
            @click="generateQR(ticket)"
            class="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm"
          >
            QRコード表示
          </button>
          <NuxtLink 
            :to="`/tickets/${ticket.id}`"
            class="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 text-sm text-center"
          >
            詳細表示
          </NuxtLink>
          <button 
            @click="downloadTicket(ticket)"
            class="flex-1 bg-gray-600 text-white py-2 px-3 rounded-md hover:bg-gray-700 text-sm"
          >
            ダウンロード
          </button>
        </div>
      </div>
    </div>

    <!-- QRコードモーダル -->
    <div v-if="showQRModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-4">入場用QRコード</h3>
          <div class="mb-4">
            <canvas ref="qrCanvas" class="mx-auto"></canvas>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            入場時にこのQRコードをスキャンしてください
          </p>
          <button 
            @click="closeQRModal"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import QRCode from 'qrcode'
const { getUser } = useUser()

const tickets = ref([])
const loading = ref(true)
const showQRModal = ref(false)
const qrCanvas = ref(null)
const selectedTicket = ref(null)

const user = ref(await getUser())

// チケット一覧取得
const fetchTickets = async () => {
  try {
    const response = await $fetch('/api/tickets/my', {
      query: { id: user.value.id } // 実際は認証から取得
    })
    tickets.value = response.tickets
  } catch (error) {
    console.error('チケット取得エラー:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  switch (status) {
    case 'PURCHASED': return 'bg-green-100 text-green-800'
    case 'USED': return 'bg-gray-100 text-gray-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'PURCHASED': return '購入済み'
    case 'USED': return '使用済み'
    case 'CANCELLED': return 'キャンセル済み'
    default: return '不明'
  }
}

const generateQR = async (ticket) => {
  selectedTicket.value = ticket
  showQRModal.value = true
  
  await nextTick()
  
  try {
    // サーバーからセキュアなQRコードを取得
    const response = await $fetch(`/api/tickets/${ticket.id}/qr`)
    
    if (qrCanvas.value && response.qrCode) {
      // DataURLから画像を作成してcanvasに描画
      const img = new Image()
      img.onload = () => {
        const ctx = qrCanvas.value.getContext('2d')
        qrCanvas.value.width = 200
        qrCanvas.value.height = 200
        ctx.drawImage(img, 0, 0, 200, 200)
      }
      img.src = response.qrCode
    }
  } catch (error) {
    console.error('QRコード生成エラー:', error)
    // フォールバック: 基本的なQRコードを生成
    if (qrCanvas.value) {
      const qrData = JSON.stringify({
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        eventId: ticket.eventId,
        timestamp: Date.now()
      })
      
      await QRCode.toCanvas(qrCanvas.value, qrData, {
        width: 200,
        margin: 2
      })
    }
  }
}

const closeQRModal = () => {
  showQRModal.value = false
  selectedTicket.value = null
}

const downloadTicket = (ticket) => {
  // PDF生成やダウンロード機能の実装
  console.log('チケットダウンロード:', ticket.ticketNumber)
}

onMounted(async () => {
  await fetchTickets()
})

useHead({
  title: 'マイチケット'
})
</script>