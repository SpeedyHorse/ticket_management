<template>
  <div>
    <!-- ヘッダーアクション -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900">イベント管理</h2>
      <UButton @click="navigateTo('/admin/events/create')" size="lg">
        <UIcon name="i-heroicons-plus" class="mr-2" />
        新規イベント作成
      </UButton>
    </div>

    <!-- ローディング状態 -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="text-center py-8">
      <UAlert icon="i-heroicons-exclamation-triangle" color="error" variant="soft" title="エラー"
        description="イベントの読み込みに失敗しました" />
      <UButton @click="refresh()" class="mt-4" variant="outline">
        再試行
      </UButton>
    </div>

    <!-- イベント一覧 -->
    <div v-else-if="events && events.length > 0" class="space-y-4">
      <div v-for="event in events" :key="event.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-semibold text-gray-900">{{ event.title }}</h3>
              <UBadge :color="getStatusColor(event.status)" variant="soft">
                {{ getStatusText(event.status) }}
              </UBadge>
            </div>
            <p>{{  event.id  }}</p>
            <p class="text-gray-600 mb-2">{{ event.venue }}</p>
            <p class="text-sm text-gray-500">
              {{ formatDateTime(event.startDate) }} - {{ formatDateTime(event.endDate) }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-primary mb-1">¥{{ formatPrice(event.price) }}</div>
            <div class="text-sm text-gray-500">
              {{ soldTickets(event) }} / {{ event.totalTickets }} 枚販売済み
            </div>
          </div>
        </div>

        <!-- 販売状況バー -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>販売状況</span>
            <span>{{ salesPercentage(event) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${salesPercentage(event)}%` }"></div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex gap-2">
          <UButton variant="outline" size="sm" @click="navigateTo(`/events/${event.id}`)">
            <UIcon name="i-heroicons-eye" class="mr-1" />
            詳細表示
          </UButton>

          <UButton variant="outline" size="sm" @click="navigateTo(`/admin/events/${event.id}/edit`)">
            <UIcon name="i-heroicons-pencil" class="mr-1" />
            編集
          </UButton>

          <UButton v-if="event.status === 'DRAFT'" color="success" size="sm" @click="publishEvent(event.id)"
            :loading="publishingEvents.has(event.id)">
            <UIcon name="i-heroicons-rocket-launch" class="mr-1" />
            公開
          </UButton>

          <UButton v-else-if="event.status === 'PUBLISHED'" color="warning" size="sm" @click="unpublishEvent(event.id)"
            :loading="unpublishingEvents.has(event.id)">
            <UIcon name="i-heroicons-pause" class="mr-1" />
            非公開
          </UButton>

          <UButton color="error" variant="outline" size="sm" @click="confirmDelete(event)"
            :disabled="soldTickets(event) > 0">
            <UIcon name="i-heroicons-trash" class="mr-1" />
            削除
          </UButton>
        </div>
      </div>
    </div>

    <!-- 空の状態 -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-calendar-x" class="text-6xl text-gray-400 mb-4" />
      <h3 class="text-xl font-semibold text-gray-600 mb-2">
        イベントがありません
      </h3>
      <p class="text-gray-500 mb-6">
        最初のイベントを作成してチケット販売を開始しましょう。
      </p>
      <UButton @click="navigateTo('/admin/events/create')" size="lg">
        <UIcon name="i-heroicons-plus" class="mr-2" />
        新規イベント作成
      </UButton>
    </div>

    <!-- 削除確認モーダル -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">イベント削除の確認</h3>
        </template>

        <div class="space-y-4">
          <p>以下のイベントを削除してもよろしいですか？</p>
          <div v-if="eventToDelete" class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold">{{ eventToDelete.title }}</h4>
            <p class="text-sm text-gray-600">{{ eventToDelete.venue }}</p>
          </div>
          <p class="text-sm text-red-600">
            ※ この操作は取り消せません。
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="showDeleteModal = false">
              キャンセル
            </UButton>
            <UButton color="error" @click="deleteEvent" :loading="deleting">
              削除
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { getUser } = useUser()
const user = await getUser()
const { handleError, handleSuccess } = useErrorHandler()

// イベント一覧の取得
const { data: eventsResponse, pending, error, refresh } = await useFetch('/api/events', {
  query: { organizerId: user?.id }
})

const events = computed(() => eventsResponse.value?.data || [])

// 状態管理
const publishingEvents = ref(new Set())
const unpublishingEvents = ref(new Set())
const showDeleteModal = ref(false)
const eventToDelete = ref(null)
const deleting = ref(false)

// 計算プロパティ
function soldTickets(event: any) {
  return event.totalTickets - event.availableTickets
}

function salesPercentage(event: any) {
  if (event.totalTickets === 0) return 0
  return Math.round((soldTickets(event) / event.totalTickets) * 100)
}

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
    case 'PUBLISHED': return '公開中'
    case 'DRAFT': return '下書き'
    case 'CANCELLED': return 'キャンセル'
    case 'COMPLETED': return '終了'
    default: return status
  }
}

// 日時フォーマット
function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 価格フォーマット
function formatPrice(price: number | string) {
  return Number(price).toLocaleString()
}

// イベント公開
async function publishEvent(eventId: string) {
  publishingEvents.value.add(eventId)

  try {
    await $fetch('/api/events/publish', {
      method: 'PATCH',
      query: { id: eventId }
    })

    handleSuccess('イベントを公開しました')
    await refresh()
  } catch (error) {
    handleError(error, 'イベントの公開に失敗しました')
  } finally {
    publishingEvents.value.delete(eventId)
  }
}

// イベント非公開
async function unpublishEvent(eventId: string) {
  unpublishingEvents.value.add(eventId)

  try {
    await $fetch('/api/events/unpublish', {
      method: 'PATCH',
      query: { id: eventId }
    })

    handleSuccess('イベントを非公開にしました')
    await refresh()
  } catch (error) {
    handleError(error, 'イベントの非公開に失敗しました')
  } finally {
    unpublishingEvents.value.delete(eventId)
  }
}

// 削除確認
function confirmDelete(event: any) {
  eventToDelete.value = event
  showDeleteModal.value = true
}

// イベント削除
async function deleteEvent() {
  if (!eventToDelete.value) return

  deleting.value = true

  try {
    await $fetch('/api/events/delete', {
      method: 'DELETE',
      query: { id: eventToDelete.value.id }
    })

    handleSuccess('イベントを削除しました')
    showDeleteModal.value = false
    eventToDelete.value = null
    await refresh()
  } catch (error) {
    handleError(error, 'イベントの削除に失敗しました')
  } finally {
    deleting.value = false
  }
}
</script>