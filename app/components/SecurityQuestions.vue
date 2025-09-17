<template>
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-2">セキュリティ質問</h2>
      <p class="text-gray-600">
        チケットの安全性を確保するため、以下の質問にお答えください。
      </p>
    </div>

    <!-- 質問読み込み中 -->
    <div v-if="loadingQuestions" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">質問を準備中...</p>
    </div>

    <!-- 質問フォーム -->
    <div v-else-if="questions.length > 0 && !completed" class="space-y-6">
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-sm text-blue-700">
          <strong>注意:</strong> 回答は10分以内に完了してください。
          時間切れの場合は再度質問を取得する必要があります。
        </p>
      </div>

      <form @submit.prevent="submitAnswers" class="space-y-6">
        <div 
          v-for="(question, index) in questions" 
          :key="question.id"
          class="p-4 border rounded-lg"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              質問 {{ index + 1 }}
            </label>
            <p class="text-gray-900 mb-3">{{ question.question }}</p>
          </div>

          <div>
            <input 
              v-model="answers[question.id]"
              type="text"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="回答を入力してください"
              :disabled="submitting"
            />
          </div>
        </div>

        <div class="flex space-x-4">
          <button 
            type="submit"
            :disabled="submitting || !allAnswered"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            <span v-if="submitting">送信中...</span>
            <span v-else>回答を送信</span>
          </button>

          <button 
            type="button"
            @click="refreshQuestions"
            :disabled="submitting"
            class="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          >
            質問を更新
          </button>
        </div>
      </form>

      <!-- 残り時間表示 -->
      <div v-if="timeRemaining > 0" class="text-center">
        <p class="text-sm text-gray-600">
          残り時間: {{ formatTime(timeRemaining) }}
        </p>
      </div>
    </div>

    <!-- 完了状態 -->
    <div v-else-if="completed" class="text-center py-8">
      <div class="mb-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-green-800 mb-2">回答完了</h3>
        <p class="text-green-600">
          セキュリティ質問への回答が完了しました。<br>
          検証トークンが生成されました。
        </p>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <p class="text-sm text-gray-600 mb-2">検証トークン:</p>
        <p class="font-mono text-sm bg-white p-2 rounded border">
          {{ verificationToken }}
        </p>
      </div>

      <button 
        @click="$emit('completed', { verificationToken, sessionId })"
        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
      >
        続行
      </button>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
      <p class="text-red-700">{{ error }}</p>
      <button 
        @click="refreshQuestions"
        class="mt-2 text-red-600 hover:underline text-sm"
      >
        再試行
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuestionTemplate } from '@prisma/client'
import { shake128 } from "@noble/hashes/sha3"
import { bytesToHex } from '@@/lib/byte'

interface QuestionsResponse {
  data: {
    questions: QuestionTemplate[]
    totalAvailable: number
  }
}

const props = defineProps({
  ticketId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['completed'])

const questions = ref([] as QuestionTemplate[])
const answers = ref({} as Record<string, string>)
const sessionId = ref('')
const verificationToken = ref('')
const loadingQuestions = ref(false)
const submitting = ref(false)
const completed = ref(false)
const error = ref('')
const timeRemaining = ref(0)
const timer = ref(null)

const allAnswered = computed(() => {
  return questions.value.every(q => answers.value[q.id]?.trim())
})

const fetchQuestions = async () => {
  loadingQuestions.value = true
  error.value = ''
  
  try {
    // ランダムな質問を取得
    const questionsResponse: QuestionsResponse = await $fetch('/api/questions/random', {
      query: { count: 3 }
    })
    
    questions.value = questionsResponse.data.questions as QuestionTemplate[]
    
    // 回答をリセット
    answers.value = {}
    questions.value.forEach((q: QuestionTemplate) => {
      answers.value[q.id] = '' as string
    })
    
  } catch (err: any) {
    error.value = err.data?.message || '質問の取得に失敗しました'
  } finally {
    loadingQuestions.value = false
  }
}

const submitAnswers = async () => {
  submitting.value = true
  error.value = ''
  
  try {
    const answersArray = questions.value.map((q: QuestionTemplate) => {
      const byteAnswer = new TextEncoder().encode(answers.value[q.id] as string)
      const answer = shake128(byteAnswer)
      const answerHex = bytesToHex(answer)
      return ({
        questionId: q.id,
        answer: answerHex
      })
    })
    
    const response = await $fetch('/api/questions/answer', {
      method: 'POST',
      body: {
        ticketId: props.ticketId,
        answers: answersArray
      }
    })
    
    verificationToken.value = response.verificationToken
    completed.value = true
    
    if (timer.value) {
      clearInterval(timer.value)
    }
    
  } catch (err) {
    error.value = err.data?.message || '回答の送信に失敗しました'
  } finally {
    submitting.value = false
  }
}

const refreshQuestions = () => {
  completed.value = false
  fetchQuestions()
}

const startTimer = (expiresAt) => {
  const updateTimer = () => {
    const now = new Date()
    const remaining = Math.max(0, expiresAt.getTime() - now.getTime())
    timeRemaining.value = Math.floor(remaining / 1000)
    
    if (remaining <= 0) {
      clearInterval(timer.value)
      error.value = 'セッションの有効期限が切れました。質問を更新してください。'
    }
  }
  
  updateTimer()
  timer.value = setInterval(updateTimer, 1000)
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchQuestions()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>