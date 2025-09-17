<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <NuxtLink 
        to="/tickets"
        class="text-blue-600 hover:underline flex items-center"
      >
        ← マイチケットに戻る
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p>読み込み中...</p>
    </div>

    <div v-else-if="ticket" class="max-w-2xl mx-auto">
      <!-- チケット詳細カード -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 class="text-2xl font-bold mb-2">{{ ticket.event?.title }}</h1>
          <p class="opacity-90">チケット番号: {{ ticket.ticketNumber }}</p>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="space-y-3">
              <div class="flex items-center text-gray-600">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z"></path>
                </svg>
                <div>
                  <div class="font-medium">開始日時</div>
                  <div>{{ formatDateTime(ticket.event.startDate) }}</div>
                </div>
              </div>

              <div class="flex items-center text-gray-600">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div>
                  <div class="font-medium">会場</div>
                  <div>{{ ticket.event.venue }}</div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center text-gray-600">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <div>
                  <div class="font-medium">価格</div>
                  <div class="text-lg font-bold">¥{{ ticket.event.price.toLocaleString() }}</div>
                </div>
              </div>

              <div class="flex items-center text-gray-600">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <div class="font-medium">ステータス</div>
                  <span 
                    :class="getStatusClass(ticket.status)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(ticket.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              @click="showQRCode"
              :disabled="ticket.status !== TicketStatus.VALID"
              class="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
              QRコード表示
            </button>

            <NuxtLink 
              :to="`/tickets/${ticket.id}/security`"
              :class="ticket.status === TicketStatus.VALID ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'"
              class="text-white py-3 px-4 rounded-md flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              セキュリティ設定
            </NuxtLink>

            <button 
              @click="downloadTicket"
              class="bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              ダウンロード
            </button>
          </div>
        </div>
      </div>

      <!-- 使用履歴 -->
      <div v-if="ticket.usedAt" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">使用履歴</h2>
        <div class="flex items-center text-gray-600">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>使用日時: {{ formatDateTime(ticket.usedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- QRコードモーダル -->
    <div v-if="showQRModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-4">入場用QRコード</h3>
          
          <div v-if="qrLoading" class="mb-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-sm text-gray-600 mt-2">QRコード生成中...</p>
          </div>
          
          <div v-else class="mb-4">
            <img v-if="qrCodeImage" :src="qrCodeImage" alt="QRコード" class="mx-auto" />
            <canvas v-else ref="qrCanvas" class="mx-auto"></canvas>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">
            入場時にこのQRコードをスキャンしてください
          </p>
          
          <div class="flex space-x-2">
            <button 
              @click="downloadQR"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              保存
            </button>
            <button 
              @click="closeQRModal"
              class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TicketStatus } from '@prisma/client'
import type { TicketIncludeEvent } from '@@/types/data'

const route = useRoute()
const ticketId = route.params.id

const ticket = ref(null as TicketIncludeEvent | null)
const loading = ref(true)
const error = ref('')
const showQRModal = ref(false)
const qrLoading = ref(false)
const qrCodeImage = ref('')
const qrCanvas = ref(null)

const fetchTicket = async () => {
  try {
    const ticketResponse: { data: TicketIncludeEvent } = await $fetch(`/api/tickets/${ticketId}`)
    if (!ticketResponse) {
      throw Error('チケット情報の取得に失敗しました')
    }
    ticket.value = ticketResponse.data
  } catch (err) {
    error.value = 'チケット情報の取得に失敗しました'
  } finally {
    loading.value = false
  }
}

const showQRCode = async () => {
  showQRModal.value = true
  qrLoading.value = true
  qrCodeImage.value = ''
  
  try {
    const response = await $fetch(`/api/tickets/${ticketId}/qr`)
    qrCodeImage.value = response?.qrCode as string
  } catch (err) {
    error.value = 'QRコードの生成に失敗しました'
  } finally {
    qrLoading.value = false
  }
}

const closeQRModal = () => {
  showQRModal.value = false
  qrCodeImage.value = ''
}

const downloadQR = () => {
  if (qrCodeImage.value) {
    const link = document.createElement('a')
    link.download = `ticket-${ticket.value.ticketNumber}-qr.png`
    link.href = qrCodeImage.value
    link.click()
  }
}

const downloadTicket = () => {
  // PDF生成やダウンロード機能の実装
  console.log('チケットダウンロード:', ticket.value.ticketNumber)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'PURCHASED': return 'bg-green-100 text-green-800'
    case 'USED': return 'bg-gray-100 text-gray-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    case 'VERIFIED': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'PURCHASED': return '購入済み'
    case 'USED': return '使用済み'
    case 'CANCELLED': return 'キャンセル済み'
    case 'VERIFIED': return '検証済み'
    default: return '不明'
  }
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchTicket()
})

useHead({
  title: () => ticket.value ? `チケット詳細 - ${ticket.value.event.title}` : 'チケット詳細'
})
</script>