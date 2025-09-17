<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
    @click="$emit('click')">
    <div class="p-6">
      <!-- ステータスバッジ -->
      <div class="flex justify-between items-start mb-3">
        <UBadge :color="getStatusColor(event.status)" variant="soft">
          {{ getStatusText(event.status) }}
        </UBadge>
        <div class="text-right">
          <div class="text-2xl font-bold text-primary">¥{{ formatPrice(event.price) }}</div>
        </div>
      </div>

      <!-- イベント名 -->
      <h3 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ event.title }}
      </h3>

      <!-- 日時・会場 -->
      <div class="space-y-2 mb-4">
        <div class="flex items-center text-gray-600 text-sm">
          <UIcon name="i-heroicons-calendar-days" class="mr-2 flex-shrink-0" />
          <span>{{ formatDate(event.startDate) }}</span>
        </div>
        <div class="flex items-center text-gray-600 text-sm">
          <UIcon name="i-heroicons-map-pin" class="mr-2 flex-shrink-0" />
          <span class="line-clamp-1">{{ event.venue }}</span>
        </div>
      </div>

      <!-- 説明 -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-3">
        {{ event.description }}
      </p>

      <!-- チケット在庫情報 -->
      <div class="mb-4">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>チケット販売状況</span>
          <span>{{ soldTickets }} / {{ event.totalTickets }} 枚</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${salesPercentage}%` }"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>残り {{ event.availableTickets }} 枚</span>
          <span>{{ salesPercentage }}% 販売済み</span>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex gap-2">
        <UButton v-if="event.status === 'PUBLISHED' && event.availableTickets > 0" size="sm" class="flex-1"
          @click.stop="purchaseTicket">
          <UIcon name="i-heroicons-ticket" class="mr-1" />
          購入
        </UButton>

        <UButton v-else-if="event.availableTickets === 0" size="sm" color="neutral" disabled class="flex-1">
          売り切れ
        </UButton>

        <NuxtLink 
          :to="`/events/${event.id}`"
          class="border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50"
          @click.stop
        >
          詳細
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Event {
  id: string
  title: string
  description: string
  venue: string
  startDate: string
  endDate: string
  price: number | string
  totalTickets: number
  availableTickets: number
  status: string
}

interface Props {
  event: Event
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const router = useRouter()

// 計算プロパティ
const soldTickets = computed(() => {
  return props.event.totalTickets - props.event.availableTickets
})

const salesPercentage = computed(() => {
  if (props.event.totalTickets === 0) return 0
  return Math.round((soldTickets.value / props.event.totalTickets) * 100)
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
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ja-JP', {
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
  router.push(`/events/${props.event.id}/purchase`)
}

// 詳細表示処理
function viewDetails() {
  router.push(`/events/${props.event.id}`)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>