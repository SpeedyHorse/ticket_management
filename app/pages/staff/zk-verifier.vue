<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">ゼロ知識証明検証システム</h1>
        <p class="text-gray-600">
          プライバシーを保護しながらチケットの有効性を検証します。
          従来のQRコードスキャンに加えて、より高度なセキュリティを提供します。
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- ZK証明検証器 -->
        <div class="lg:col-span-2">
          <ZKProofVerifier @proof-verified="onProofVerified" />
        </div>

        <!-- サイドパネル -->
        <div class="space-y-6">
          <!-- 検証統計 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">検証統計</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">本日の検証数</span>
                <span class="font-semibold">{{ stats.totalVerifications }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">成功</span>
                <span class="font-semibold text-green-600">{{ stats.successfulVerifications }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">失敗</span>
                <span class="font-semibold text-red-600">{{ stats.failedVerifications }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">成功率</span>
                <span class="font-semibold">{{ successRate }}%</span>
              </div>
            </div>
          </div>

          <!-- 最近の検証履歴 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">最近の検証履歴</h3>
            <div v-if="verificationHistory.length === 0" class="text-center py-4 text-gray-500">
              まだ検証履歴がありません
            </div>
            <div v-else class="space-y-3 max-h-64 overflow-y-auto">
              <div 
                v-for="verification in verificationHistory" 
                :key="verification.id"
                class="p-3 border rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-sm">{{ verification.ticketId.slice(0, 8) }}...</span>
                  <span 
                    :class="verification.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ verification.verified ? '成功' : '失敗' }}
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(verification.timestamp) }}
                </div>
              </div>
            </div>
          </div>

          <!-- セキュリティレベル -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">セキュリティレベル</h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span class="text-sm">ゼロ知識証明</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span class="text-sm">暗号学的ハッシュ</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span class="text-sm">タイムスタンプ検証</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span class="text-sm">署名検証</span>
              </div>
            </div>
          </div>

          <!-- 操作パネル -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">操作</h3>
            <div class="space-y-3">
              <button 
                @click="clearHistory"
                class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                履歴をクリア
              </button>
              <button 
                @click="exportStats"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                統計をエクスポート
              </button>
              <NuxtLink 
                to="/staff/scanner"
                class="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-center"
              >
                QRスキャナーに切り替え
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- アラート表示 -->
      <div v-if="alerts.length > 0" class="mt-8">
        <div class="space-y-2">
          <div 
            v-for="alert in alerts" 
            :key="alert.id"
            :class="getAlertClass(alert.type)"
            class="p-4 rounded-lg flex items-center justify-between"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{{ alert.message }}</span>
            </div>
            <button 
              @click="dismissAlert(alert.id)"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// const verificationHistory = ref([])
// const alerts = ref([])
// const stats = ref({
//   totalVerifications: 0,
//   successfulVerifications: 0,
//   failedVerifications: 0
// })

// const successRate = computed(() => {
//   if (stats.value.totalVerifications === 0) return 0
//   return Math.round((stats.value.successfulVerifications / stats.value.totalVerifications) * 100)
// })

// const onProofVerified = (result) => {
//   // 検証履歴に追加
//   const historyItem = {
//     id: Date.now(),
//     ticketId: result.ticketId,
//     verified: result.verified,
//     timestamp: new Date(result.timestamp)
//   }
  
//   verificationHistory.value.unshift(historyItem)
  
//   // 履歴は最新50件まで保持
//   if (verificationHistory.value.length > 50) {
//     verificationHistory.value = verificationHistory.value.slice(0, 50)
//   }
  
//   // 統計を更新
//   stats.value.totalVerifications++
//   if (result.verified) {
//     stats.value.successfulVerifications++
//     addAlert('success', `ZK証明検証成功: チケット ${result.ticketId.slice(0, 8)}...`)
//   } else {
//     stats.value.failedVerifications++
//     addAlert('error', `ZK証明検証失敗: チケット ${result.ticketId.slice(0, 8)}...`)
//   }
// }

// const addAlert = (type, message) => {
//   const alert = {
//     id: Date.now(),
//     type,
//     message,
//     timestamp: new Date()
//   }
  
//   alerts.value.unshift(alert)
  
//   // アラートは最新5件まで保持
//   if (alerts.value.length > 5) {
//     alerts.value = alerts.value.slice(0, 5)
//   }
  
//   // 10秒後に自動削除
//   setTimeout(() => {
//     dismissAlert(alert.id)
//   }, 10000)
// }

// const dismissAlert = (alertId) => {
//   const index = alerts.value.findIndex(a => a.id === alertId)
//   if (index > -1) {
//     alerts.value.splice(index, 1)
//   }
// }

// const clearHistory = () => {
//   verificationHistory.value = []
//   stats.value = {
//     totalVerifications: 0,
//     successfulVerifications: 0,
//     failedVerifications: 0
//   }
//   addAlert('info', '履歴をクリアしました')
// }

// const exportStats = () => {
//   const data = {
//     stats: stats.value,
//     history: verificationHistory.value,
//     exportedAt: new Date().toISOString()
//   }
  
//   const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
//   const url = URL.createObjectURL(blob)
//   const link = document.createElement('a')
//   link.href = url
//   link.download = `zk-verification-stats-${new Date().toISOString().split('T')[0]}.json`
//   link.click()
//   URL.revokeObjectURL(url)
  
//   addAlert('success', '統計データをエクスポートしました')
// }

// const getAlertClass = (type) => {
//   switch (type) {
//     case 'success': return 'bg-green-100 text-green-800 border border-green-200'
//     case 'error': return 'bg-red-100 text-red-800 border border-red-200'
//     case 'warning': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
//     case 'info': return 'bg-blue-100 text-blue-800 border border-blue-200'
//     default: return 'bg-gray-100 text-gray-800 border border-gray-200'
//   }
// }

// const formatTime = (date) => {
//   return date.toLocaleTimeString('ja-JP', {
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   })
// }

// useHead({
//   title: 'ゼロ知識証明検証システム'
// })
</script>