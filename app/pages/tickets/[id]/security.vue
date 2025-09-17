<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <NuxtLink 
        to="/tickets"
        class="text-blue-600 hover:underline flex items-center"
      >
        ← マイチケットに戻る
      </NuxtLink>
    </div>

    <div v-if="ticket" class="mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-4">チケットセキュリティ設定</h1>
        
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold mb-2">{{ ticket.event.title }}</h3>
          <p class="text-gray-600">チケット番号: {{ ticket.ticketNumber }}</p>
          <p class="text-gray-600">日時: {{ formatDate(ticket.event.startDate) }}</p>
        </div>

        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-3">セキュリティ質問の設定</h2>
          <p class="text-gray-600 mb-4">
            入場時の本人確認のため、セキュリティ質問を設定してください。
            設定した質問と回答は入場時に必要となります。
          </p>
        </div>
      </div>
    </div>

    <SecurityQuestions 
      v-if="ticket"
      :ticket-id="ticket.id"
      @completed="onSecurityCompleted"
    />

    <!-- 完了後の表示 -->
    <div v-if="securityCompleted" class="mt-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-green-800 mb-2">設定完了</h3>
          <p class="text-green-600 mb-4">
            セキュリティ質問の設定が完了しました。<br>
            入場時にこの質問への回答が必要になります。
          </p>
          
          <div class="flex space-x-4 justify-center">
            <NuxtLink 
              to="/tickets"
              class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              マイチケットに戻る
            </NuxtLink>
            
            <NuxtLink 
              :to="`/tickets/${ticket.id}`"
              class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              チケット詳細を見る
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- エラー表示 -->
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TicketIncludeEvent } from '@@/types/data'

const route = useRoute()
const ticketId = route.params.id

const ticket = ref(null as TicketIncludeEvent | null)
const securityCompleted = ref(false)
const error = ref('')

const fetchTicket = async () => {
  try {
    const response: { data: TicketIncludeEvent } = await $fetch(`/api/tickets/${ticketId}`)
    if (!response) {
      throw Error('チケット情報の取得に失敗しました')
    }
    ticket.value = response.data
  } catch (err) {
    error.value = 'チケット情報の取得に失敗しました'
  }
}

const fetchQuestions = async () => {
  
}

const onSecurityCompleted = (data) => {
  securityCompleted.value = true
  // 必要に応じて検証トークンを保存
  console.log('Security completed:', data)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchTicket()
})

useHead({
  title: 'セキュリティ質問設定'
})
</script>