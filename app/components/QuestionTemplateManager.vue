<template>
  <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">質問テンプレート管理</h2>
      <button
        @click="showCreateForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        新規作成
      </button>
    </div>

    <!-- 作成フォーム -->
    <div v-if="showCreateForm" class="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 class="text-lg font-semibold mb-4">新しい質問テンプレート</h3>
      <form @submit.prevent="createTemplate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            質問内容
          </label>
          <textarea 
            v-model="newTemplate.question"
            required
            rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="質問内容を入力してください"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <input 
              v-model="newTemplate.category"
              type="text"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="例: 一般知識"
            />
          </div>
        </div>

        <div class="flex space-x-2">
          <button 
            type="submit"
            :disabled="loading"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            作成
          </button>
          <button 
            type="button"
            @click="cancelCreate"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>

    <!-- テンプレート一覧 -->
    <div v-if="templates.length === 0 && !loading" class="text-center py-8">
      <p class="text-gray-600">質問テンプレートがありません</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="template in templates" 
        :key="template.id"
        class="border rounded-lg p-4 hover:bg-gray-50"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="font-medium mb-2">{{ template.question }}</p>
            <div class="flex space-x-4 text-sm text-gray-600">
              <span>カテゴリ: {{ template.category }}</span>
              <span>作成日: {{ formatDate(template.createdAt) }}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span 
              :class="template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              class="px-2 py-1 rounded-full text-xs font-medium"
            >
              {{ template.isActive ? '有効' : '無効' }}
            </span>
            <button 
              @click="toggleTemplate(template)"
              class="text-blue-600 hover:underline text-sm"
            >
              {{ template.isActive ? '無効化' : '有効化' }}
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

<script setup>
const templates = ref([])
const loading = ref(false)
const error = ref('')
const showCreateForm = ref(false)

const newTemplate = ref({
  question: '',
  category: '',
  isActive: true
})

const fetchTemplates = async () => {
  try {
    const response = await $fetch('/api/questions/templates')
    templates.value = response.templates
  } catch (err) {
    error.value = 'テンプレートの取得に失敗しました'
  }
}

const createTemplate = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await $fetch('/api/questions/templates', {
      method: 'POST',
      body: newTemplate.value
    })
    
    await fetchTemplates()
    cancelCreate()
    
  } catch (err) {
    error.value = err.data?.message || 'テンプレートの作成に失敗しました'
  } finally {
    loading.value = false
  }
}

const cancelCreate = () => {
  showCreateForm.value = false
  newTemplate.value = {
    question: '',
    category: '',
    isActive: true
  }
}

const toggleTemplate = async (template) => {
  try {
    await $fetch(`/api/questions/templates/${template.id}`, {
      method: 'PATCH',
      body: { isActive: !template.isActive }
    })
    
    await fetchTemplates()
    
  } catch (err) {
    error.value = 'テンプレートの更新に失敗しました'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP')
}

onMounted(() => {
  fetchTemplates()
})
</script>