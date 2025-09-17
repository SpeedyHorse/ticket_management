<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">イベント一覧</h1>
      <p class="text-gray-600">開催予定のイベントからお気に入りを見つけてください。</p>
    </div>

    <!-- 検索・フィルター -->
    <div class="mb-8 bg-white rounded-lg shadow-md p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            カテゴリ
          </label>
          <select 
            v-model="filters.category"
            @change="fetchEvents"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">全て</option>
            <option value="music">音楽</option>
            <option value="sports">スポーツ</option>
            <option value="conference">カンファレンス</option>
            <option value="other">その他</option>
          </select>
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
            価格帯
          </label>
          <select 
            v-model="filters.priceRange"
            @change="fetchEvents"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">全て</option>
            <option value="free">無料</option>
            <option value="low">〜¥5,000</option>
            <option value="medium">¥5,000〜¥15,000</option>
            <option value="high">¥15,000〜</option>
          </select>
        </div>
      </div>
    </div>

    <!-- イベント一覧 -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>読み込み中...</p>
    </div>

    <div v-else-if="events.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z"></path>
      </svg>
      <p class="text-gray-600 mb-4">条件に合うイベントが見つかりませんでした</p>
      <button 
        @click="clearFilters"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        フィルターをクリア
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCard 
        v-for="event in events" 
        :key="event.id" 
        :event="event"
        @click="goToEvent(event.id)"
      />
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
const router = useRouter()

const events = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const searchTimeout = ref(null)

const filters = ref({
  search: '',
  category: '',
  startDate: '',
  priceRange: ''
})

const fetchEvents = async () => {
  loading.value = true
  
  try {
    const query = {
      page: currentPage.value,
      status: 'PUBLISHED',
      ...filters.value
    }
    
    const response = await $fetch('/api/events', { query })
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

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    startDate: '',
    priceRange: ''
  }
  currentPage.value = 1
  fetchEvents()
}

const goToEvent = (eventId) => {
  router.push(`/events/${eventId}`)
}

onMounted(() => {
  fetchEvents()
})

useHead({
  title: 'イベント一覧'
})
</script>