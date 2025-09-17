<template>
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-4">チケット購入</h2>

        <div v-if="event" class="mb-6">
            <h3 class="text-lg font-semibold">{{ event.title || event.name }}</h3>
            <p class="text-gray-600">{{ formatDate(event.startDate || event.date) }}</p>
            <p class="text-gray-600">{{ event.venue || event.location }}</p>
            <p class="text-lg font-bold text-blue-600">¥{{ event.price?.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">残り{{ availableTickets }}枚</p>
        </div>

        <div v-else-if="!event && !error" class="mb-6 text-center">
            <p class="text-gray-500">読み込み中...</p>
        </div>

        <!-- デバッグ情報 -->
        <div v-if="event" class="mb-4 p-2 bg-gray-100 text-xs">
            <p>Debug: availableTickets = {{ availableTickets }}</p>
            <p>Debug: ticketOptions = {{ ticketOptions }}</p>
            <p>Debug: event.availableTickets = {{ event.availableTickets }}</p>
        </div>

        <form @submit.prevent="purchaseTickets" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    購入枚数
                </label>
                <select v-model="quantity" class="w-full border border-gray-300 rounded-md px-3 py-2"
                    :disabled="loading || ticketOptions.length === 0">
                    <option v-if="ticketOptions.length === 0" value="0" disabled>
                        在庫なし
                    </option>
                    <option v-for="n in ticketOptions" :key="n" :value="n">
                        {{ n }}枚
                    </option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                </label>
                <input v-model="email" type="email" required class="w-full border border-gray-300 rounded-md px-3 py-2"
                    :disabled="loading" placeholder="your@email.com" />
            </div>

            <div class="border-t pt-4">
                <div class="flex justify-between items-center mb-2">
                    <span>小計:</span>
                    <span class="font-semibold">¥{{ totalPrice.toLocaleString() }}</span>
                </div>
            </div>

            <button type="submit" :disabled="loading || availableTickets === 0"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                <span v-if="loading">処理中...</span>
                <span v-else-if="availableTickets === 0">売り切れ</span>
                <span v-else>購入する</span>
            </button>
        </form>

        <!-- 成功メッセージ -->
        <div v-if="purchaseSuccess" class="mt-4 p-4 bg-green-100 border border-green-400 rounded-md">
            <p class="text-green-700">{{ successMessage }}</p>
            <button @click="$emit('view-tickets')" class="mt-2 text-blue-600 hover:underline">
                マイチケットを確認
            </button>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
            <p class="text-red-700">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    eventId: String
})

const emit = defineEmits(['view-tickets'])

const event = ref(null)
const quantity = ref(1)
const email = ref('')
const loading = ref(false)
const error = ref('')
const purchaseSuccess = ref(false)
const successMessage = ref('')

const availableTickets = computed(() => {
    if (!event.value) return 0
    // イベントデータに直接 availableTickets があるかチェック
    if (typeof event.value.availableTickets === 'number') {
        return Math.max(0, event.value.availableTickets)
    }
    // なければ計算
    const total = event.value.totalTickets || event.value.maxTickets || 0
    const sold = event.value.soldTickets || event.value._count?.tickets || 0
    return Math.max(0, total - sold)
})

const totalPrice = computed(() => {
    if (!event.value) return 0
    return event.value.price * quantity.value
})

const ticketOptions = computed(() => {
    const max = Math.min(10, availableTickets.value)
    const options = max > 0 ? Array.from({ length: max }, (_, i) => i + 1) : []

    // 初期値を設定
    if (options.length > 0 && !options.includes(quantity.value)) {
        quantity.value = options[0]
    }

    return options
})

// イベント情報取得
onMounted(async () => {
    try {
        const response = await $fetch(`/api/events/${props.eventId}`)
        event.value = response.data
    } catch (err) {
        error.value = 'イベント情報の取得に失敗しました'
    }
})

const purchaseTickets = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await $fetch('/api/tickets/purchase', {
            method: 'POST',
            body: {
                eventId: props.eventId,
                quantity: quantity.value,
                userEmail: email.value
            }
        })

        purchaseSuccess.value = true
        successMessage.value = response.message

        // イベント情報を更新
        const updatedResponse = await $fetch(`/api/events/${props.eventId}`)
        event.value = updatedResponse.data

    } catch (err) {
        error.value = err.data?.message || 'エラーが発生しました'
    } finally {
        loading.value = false
    }
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>