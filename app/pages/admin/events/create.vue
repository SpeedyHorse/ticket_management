<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <NuxtLink 
          to="/admin/events"
          class="text-blue-600 hover:underline flex items-center"
        >
          ← イベント管理に戻る
        </NuxtLink>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">新規イベント作成</h1>

        <form @submit.prevent="createEvent" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              イベント名 *
            </label>
            <input 
              v-model="form.title"
              type="text"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="イベント名を入力"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea 
              v-model="form.description"
              rows="4"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="イベントの説明を入力"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                開始日時 *
              </label>
              <input 
                v-model="form.startDate"
                type="datetime-local"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                終了日時 *
              </label>
              <input 
                v-model="form.endDate"
                type="datetime-local"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              会場 *
            </label>
            <input 
              v-model="form.venue"
              type="text"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="会場名を入力"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                チケット価格 *
              </label>
              <input 
                v-model.number="form.price"
                type="number"
                min="0"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                総チケット数 *
              </label>
              <input 
                v-model.number="form.totalTickets"
                type="number"
                min="1"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select 
              v-model="form.status"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="DRAFT">下書き</option>
              <option value="PUBLISHED">公開</option>
            </select>
          </div>

          <div class="flex space-x-4">
            <button 
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              <span v-if="loading">作成中...</span>
              <span v-else>イベントを作成</span>
            </button>

            <button 
              type="button"
              @click="saveDraft"
              :disabled="loading"
              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
              下書き保存
            </button>
          </div>
        </form>

        <!-- エラーメッセージ -->
        <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <!-- 成功メッセージ -->
        <div v-if="success" class="mt-4 p-4 bg-green-100 border border-green-400 rounded-md">
          <p class="text-green-700">{{ success }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()

const form = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  venue: '',
  price: 0,
  totalTickets: 100,
  status: 'DRAFT'
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const createEvent = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const response = await $fetch('/api/admin/events', {
      method: 'POST',
      body: form.value
    })
    
    success.value = 'イベントを作成しました'
    
    setTimeout(() => {
      router.push(`/admin/events/${response.event.id}`)
    }, 1500)
    
  } catch (err) {
    error.value = err.data?.message || 'イベントの作成に失敗しました'
  } finally {
    loading.value = false
  }
}

const saveDraft = async () => {
  form.value.status = 'DRAFT'
  await createEvent()
}

// 初期値設定
onMounted(() => {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  
  form.value.startDate = tomorrow.toISOString().slice(0, 16)
  form.value.endDate = dayAfter.toISOString().slice(0, 16)
})

useHead({
  title: '新規イベント作成'
})
</script>