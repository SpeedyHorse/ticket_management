<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">イベント管理</h1>
      <NuxtLink 
        to="/admin/events/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        新規イベント作成
      </NuxtLink>
    </div>

    <!-- フィルター -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select 
            v-model="filters.status"
            @change="fetchEvents"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">全て</option>
            <option value="DRAFT">下書き</option>
            <option value="PUBLISHED">公開中</option>
            <option value="CANCELLED">キャンセル</option>
            <option value="COMPLETED">終了</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            検索
          </label>
          <input 
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="イベント名で検索"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            開始日から
          </label>
          <input 
            v-model="filters.startDate"
            @change="fetchEvents"
            type="date"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            開始日まで
          </label>
          <input 
            v-model="filters.endDate"
            @change="fetchEvents"
            type="date"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
    </div>

    <!-- イベント一覧 -->
    <div v-if="loading" class="text-center py-8">
      <p>読み込み中...</p>
    </div>

    <div v-else-if="events.length === 0" class="text-center py-8">
      <p class="text-gray-600">イベントがありません</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="event in events" 
        :key="event.id"
        class="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold">{{ event.title }}</h3>
              <span 
                :class="getStatusClass(event.status)"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ getStatusText(event.status) }}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span class="font-medium">開始:</span>
                {{ formatDateTime(event.startDate) }}
              </div>
              <div>
                <span class="font-medium">会場:</span>
                {{ event.venue }}
              </div>
              <div>
                <span class="font-medium">価格:</span>
                ¥{{ event.price.toLocaleString() }}
              </div>
            </div>

            <div class="flex space-x-6 text-sm">
              <div>
                <span class="font-medium">販売済み:</span>
                {{ event.soldTickets || 0 }} / {{ event.totalTickets }} 枚
              </div>
              <div>
                <span class="font-medium">売上:</span>
                ¥{{ ((event.soldTickets || 0) * event.price).toLocaleString() }}
              </div>
              <div>
                <span class="font-medium">作成日:</span>
                {{ formatDate(event.createdAt) }}
              </div>
            </div>
          </div>

          <div class="flex flex-col space-y-2 ml-4">
            <NuxtLink 
              :to="`/admin/events/${event.id}`"
              class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              詳細
            </NuxtLink>
            <NuxtLink 
              :to="`/admin/events/${event.id}/edit`"
              class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              編集
            </NuxtLink>
            <button 
              @click="toggleStatus(event)"
              :class="event.status === 'PUBLISHED' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'"
              class="text-white px-3 py-1 rounded text-sm"
            >
              {{ event.status === 'PUBLISHED' ? '非公開' : '公開' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ページネーション -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <div class="flex space-x-2">
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="changePage(page)"
          :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          class="px-3 py-2 rounded"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const events = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const searchTimeout = ref(null)

const filters = ref({
  status: '',
  search: '',
  startDate: '',
  endDate: ''
})

const fetchEvents = async () => {
  loading.value = true
  
  try {
    const query = {
      page: currentPage.value,
      ...filters.value
    }
    
    const response = await $fetch('/api/admin/events', { query })
    events.value = response.events
    totalPages.value = response.totalPages
    
  } catch (error) {
    console.error('イベント取得エラー:', error)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    fetchEvents()
  }, 500)
}

const changePage = (page) => {
  currentPage.value = page
  fetchEvents()
}

const toggleStatus = async (event) => {
  try {
    const newStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    
    await $fetch(`/api/admin/events/${event.id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    
    await fetchEvents()
    
  } catch (error) {
    console.error('ステータス更新エラー:', error)
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'PUBLISHED': return 'bg-green-100 text-green-800'
    case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    case 'COMPLETED': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'PUBLISHED': return '公開中'
    case 'DRAFT': return '下書き'
    case 'CANCELLED': return 'キャンセル'
    case 'COMPLETED': return '終了'
    default: return status
  }
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP')
}

onMounted(() => {
  fetchEvents()
})

useHead({
  title: 'イベント管理'
})
</script>