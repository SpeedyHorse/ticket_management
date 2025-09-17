<template>
    <div class="min-h-screen bg-gray-50">
        <!-- ヘッダー -->
        <header class="bg-white shadow-sm">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-primary">チケット管理システム</h1>

                    <div class="flex items-center gap-4">
                        <div v-if="status === 'authenticated'" class="flex items-center gap-4">
                            <span class="text-sm text-gray-600">こんにちは、{{ data?.user?.name }}さん</span>
                            <UButton variant="outline" size="sm" @click="navigateTo('/admin/dashboard')">
                                ダッシュボード
                            </UButton>
                            <UButton variant="ghost" size="sm" @click="() => signOut()">
                                ログアウト
                            </UButton>
                        </div>
                        <UButton v-else @click="signIn('github')">
                            ログイン
                        </UButton>
                    </div>
                </div>
            </div>
        </header>

        <!-- メインコンテンツ -->
        <main class="container mx-auto px-4 py-8">
            <!-- ヒーローセクション -->
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">
                    イベントを見つけよう
                </h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    様々なイベントのチケットを簡単に購入できます。お気に入りのイベントを見つけて、素晴らしい体験をお楽しみください。
                </p>
            </div>

            <!-- イベント一覧 -->
            <div v-if="pending" class="flex justify-center items-center min-h-64">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
            </div>

            <div v-else-if="error" class="text-center py-8">
                <UAlert icon="i-heroicons-exclamation-triangle" color="error" variant="soft" title="エラー"
                    description="イベントの読み込みに失敗しました" />
                <UButton @click="refresh()" class="mt-4" variant="outline">
                    再試行
                </UButton>
            </div>

            <div v-else-if="events && events.length > 0">
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <EventCard v-for="event in events" :key="event.id" :event="event"
                        @click="navigateTo(`/events/${event.id}`)" />
                </div>
            </div>

            <div v-else class="text-center py-12">
                <UIcon name="i-heroicons-calendar-x" class="text-6xl text-gray-400 mb-4" />
                <h3 class="text-xl font-semibold text-gray-600 mb-2">
                    現在販売中のイベントはありません
                </h3>
                <p class="text-gray-500">
                    新しいイベントが追加されるまでお待ちください。
                </p>
            </div>
        </main>

        <!-- フッター -->
        <footer class="bg-white border-t mt-16">
            <div class="container mx-auto px-4 py-8">
                <div class="text-center text-gray-600">
                    <p>&copy; 2024 チケット管理システム. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '#imports'

const { signIn, status, signOut, data } = useAuth()

// 公開イベント一覧の取得
const { data: eventsResponse, pending, error, refresh } = await useFetch('/api/events', {
    query: { published: 'true' }
})

const events = computed(() => eventsResponse.value?.data || [])
console.log(events.value)

// SEO設定
useSeoMeta({
    title: 'チケット管理システム - イベント一覧',
    description: '様々なイベントのチケットを購入できるチケット管理システムです。'
})
</script>