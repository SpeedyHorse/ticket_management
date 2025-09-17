<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
    </div>

    <div v-else-if="error" class="text-center py-8">
      <UAlert icon="i-heroicons-exclamation-triangle" color="error" variant="soft" title="エラー"
        :description="error.message || 'イベントの読み込みに失敗しました'" />
      <UButton @click="refresh()" class="mt-4" variant="outline">
        再試行
      </UButton>
    </div>

    <div v-else-if="event" class="max-w-4xl mx-auto">
      <!-- イベント基本情報 -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-3xl font-bold text-gray-900">{{ event.title }}</h1>
            <UBadge :color="getStatusColor(event.status)" variant="soft" size="lg">
              {{ getStatusText(event.status) }}
            </UBadge>
          </div>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <!-- 日時情報 -->
            <div class="space-y-3">
              <div class="flex items-center text-gray-600">
                <UIcon name="i-heroicons-calendar-days" class="mr-2" />
                <div>
                  <div class="font-medium">開始日時</div>
                  <div>{{ formatDateTime(event.startDate) }}</div>
                </div>
              </div>
              <div class="flex items-center text-gray-600">
                <UIcon name="i-heroicons-calendar-days" class="mr-2" />
                <div>
                  <div class="font-medium">終了日時</div>
                  <div>{{ formatDateTime(event.endDate) }}</div>
                </div>
              </div>
            </div>

            <!-- 会場・価格情報 -->
            <div class="space-y-3">
              <div class="flex items-center text-gray-600">
                <UIcon name="i-heroicons-map-pin" class="mr-2" />
                <div>
                  <div class="font-medium">会場</div>
                  <div>{{ event.venue }}</div>
                </div>
              </div>
              <div class="flex items-center text-gray-600">
                <UIcon name="i-heroicons-currency-yen" class="mr-2" />
                <div>
                  <div class="font-medium">価格</div>
                  <div class="text-2xl font-bold text-primary">¥{{ formatPrice(event.price) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- チケット在庫情報 -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">チケット販売状況</span>
              <span class="text-sm text-gray-600">
                {{ event.soldTickets || 0 }} / {{ event.totalTickets }} 枚販売済み
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-primary h-2 rounded-full transition-all duration-300"
                :style="{ width: `${event.salesPercentage || 0}%` }"></div>
            </div>
            <div class="flex justify-between text-sm text-gray-600 mt-1">
              <span>{{ event.availableTickets }} 枚残り</span>
              <span>{{ event.salesPercentage || 0 }}% 販売済み</span>
            </div>
          </div>

          <!-- 説明 -->
          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-3">イベント詳細</h2>
            <p class="text-gray-700 whitespace-pre-wrap">{{ event.description }}</p>
          </div>

          <!-- アクションボタン -->
          <div class="flex gap-4">
            <UButton v-if="event.status === 'PUBLISHED' && event.availableTickets > 0" size="lg" @click="purchaseTicket"
              :disabled="!canPurchase">
              <UIcon name="i-heroicons-ticket" class="mr-2" />
              チケットを購入
            </UButton>

            <UButton v-else-if="event.availableTickets === 0" size="lg" color="neutral" disabled>
              <UIcon name="i-heroicons-x-circle" class="mr-2" />
              売り切れ
            </UButton>

            <UButton variant="outline" size="lg" @click="goBack">
              <UIcon name="i-heroicons-arrow-left" class="mr-2" />
              戻る
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { data } = useAuth()
const user = computed(() => data.value?.user)

const eventId = route.params.id as string

console.log('Frontend eventId:', eventId, 'Route params:', route.params)

// イベントデータの取得
const { data: eventResponse, pending, error, refresh } = await useFetch(`/api/events/${eventId}`, {
  onRequest({ request }) {
    console.log('Making request to:', request)
  },
  onRequestError({ error }) {
    console.error('Request error:', error)
  }
})

const event = computed(() => eventResponse.value?.data)

// 購入可能かどうかの判定
const canPurchase = computed(() => {
  if (!event.value || !user.value) return false
  return event.value.status === 'PUBLISHED' &&
    event.value.availableTickets > 0 &&
    new Date(event.value.startDate) > new Date()
})

// ステータス表示用の関数
function getStatusColor(status: string) {
  switch (status) {
    case 'PUBLISHED': return 'success'
    case 'DRAFT': return 'warning'
    case 'CANCELLED': return 'error'
    case 'COMPLETED': return 'neutral'
    default: return 'neutral'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'PUBLISHED': return '販売中'
    case 'DRAFT': return '下書き'
    case 'CANCELLED': return 'キャンセル'
    case 'COMPLETED': return '終了'
    default: return status
  }
}

// 日時フォーマット
function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 価格フォーマット
function formatPrice(price: number | string) {
  return Number(price).toLocaleString()
}

// チケット購入処理
function purchaseTicket() {
  if (!user.value) {
    router.push('/auth/login')
    return
  }

  router.push(`/purchase/${eventId}`)
}

// 戻る処理
function goBack() {
  router.back()
}

// SEO設定
useSeoMeta({
  title: () => event.value ? `${event.value.title} - チケット管理システム` : 'イベント詳細',
  description: () => event.value?.description || 'イベントの詳細情報'
})
</script>