<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">チケット検証スキャナー</h1>
        <p class="text-gray-600">
          QRコードをスキャンしてチケットの有効性を確認し、入場処理を行います。
        </p>
      </div>

      <!-- イベント選択 -->
      <div class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">イベント選択</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              対象イベント
            </label>
            <select 
              v-model="selectedEventId"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">イベントを選択してください</option>
              <option 
                v-for="event in events" 
                :key="event.id" 
                :value="event.id"
              >
                {{ event.title }} - {{ formatDate(event.startDate) }}
              </option>
            </select>
          </div>

          <div v-if="selectedEvent" class="flex items-end">
            <div class="text-sm text-gray-600">
              <p><strong>会場:</strong> {{ selectedEvent.venue }}</p>
              <p><strong>開始:</strong> {{ formatDateTime(selectedEvent.startDate) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- QRスキャナー -->
        <div>
          <QRScanner 
            :event-id="selectedEventId"
            @scan-result="onScanResult"
            @ticket-used="onTicketUsed"
          />
        </div>

        <!-- 統計情報 -->
        <div class="space-y-6">
          <!-- 本日の統計 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">本日の統計</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ stats.scanned }}</div>
                <div class="text-sm text-gray-600">スキャン済み</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ stats.admitted }}</div>
                <div class="text-sm text-gray-600">入場済み</div>
              </div>
            </div>
          </div>

          <!-- 最近のスキャン履歴 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">最近のスキャン履歴</h3>
            <div v-if="scanHistory.length === 0" class="text-center py-4 text-gray-500">
              まだスキャン履歴がありません
            </div>
            <div v-else class="space-y-3 max-h-64 overflow-y-auto">
              <div 
                v-for="scan in scanHistory" 
                :key="scan.id"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex-1">
                  <div class="font-medium">{{ scan.ticketNumber }}</div>
                  <div class="text-sm text-gray-600">{{ scan.userEmail }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(scan.timestamp) }}</div>
                </div>
                <div>
                  <span 
                    :class="scan.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ scan.verified ? '成功' : '失敗' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- アラート -->
          <div v-if="alerts.length > 0" class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">アラート</h3>
            <div class="space-y-2">
              <div 
                v-for="alert in alerts" 
                :key="alert.id"
                :class="getAlertClass(alert.type)"
                class="p-3 rounded-lg"
              >
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span class="text-sm">{{ alert.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const selectedEventId = ref('')
const events = ref([])
const scanHistory = ref([])
const stats = ref({
  scanned: 0,
  admitted: 0
})
const alerts = ref([])

const selectedEvent = computed(() => {
  return events.value.find(e => e.id === selectedEventId.value)
})

const fetchEvents = async () => {
  try {
    const response = await $fetch('/api/admin/events', {
      query: { 
        status: 'PUBLISHED',
        limit: 50 
      }
    })
    events.value = response.events
  } catch (error) {
    console.error('イベント取得エラー:', error)
  }
}

const onScanResult = (result) => {
  // スキャン履歴に追加
  const historyItem = {
    id: Date.now(),
    ticketNumber: result.ticket?.ticketNumber || 'Unknown',
    userEmail: result.ticket?.userEmail || 'Unknown',
    verified: result.verified,
    timestamp: new Date()
  }
  
  scanHistory.value.unshift(historyItem)
  
  // 履歴は最新20件まで保持
  if (scanHistory.value.length > 20) {
    scanHistory.value = scanHistory.value.slice(0, 20)
  }
  
  // 統計を更新
  stats.value.scanned++
  
  // アラートを追加
  if (!result.verified) {
    addAlert('error', `無効なチケット: ${result.message}`)
  }
}

const onTicketUsed = (ticket) => {
  stats.value.admitted++
  addAlert('success', `入場完了: ${ticket.ticketNumber}`)
}

const addAlert = (type, message) => {
  const alert = {
    id: Date.now(),
    type,
    message,
    timestamp: new Date()
  }
  
  alerts.value.unshift(alert)
  
  // アラートは最新10件まで保持
  if (alerts.value.length > 10) {
    alerts.value = alerts.value.slice(0, 10)
  }
  
  // 5秒後に自動削除
  setTimeout(() => {
    const index = alerts.value.findIndex(a => a.id === alert.id)
    if (index > -1) {
      alerts.value.splice(index, 1)
    }
  }, 5000)
}

const getAlertClass = (type) => {
  switch (type) {
    case 'success': return 'bg-green-100 text-green-800'
    case 'error': return 'bg-red-100 text-red-800'
    case 'warning': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  fetchEvents()
})

useHead({
  title: 'チケット検証スキャナー'
})
</script>