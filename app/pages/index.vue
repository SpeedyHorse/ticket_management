<template>
    <div class="min-h-screen bg-gray-50">
        <!-- ヒーローセクション -->
        <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
            <div class="container mx-auto px-4 text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">
                    セキュアなチケット管理システム
                </h1>
                <p class="text-xl md:text-2xl mb-8 opacity-90">
                    ブロックチェーン技術とゼロ知識証明で、安全で透明なチケット販売を実現
                </p>
                <div class="space-x-4">
                    <NuxtLink 
                        to="/events"
                        class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        イベントを探す
                    </NuxtLink>
                    <NuxtLink 
                        to="/tickets"
                        class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                    >
                        マイチケット
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- メインコンテンツ -->
        <main class="container mx-auto px-4 py-8">
            <!-- 特徴セクション -->
            <section class="py-16 bg-white">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">システムの特徴</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        最新の暗号技術を活用した、安全で使いやすいチケット管理システムです。
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <!-- セキュリティ -->
                    <div class="text-center p-6">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UIcon name="i-heroicons-shield-check" class="text-2xl text-blue-600" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">高度なセキュリティ</h3>
                        <p class="text-gray-600">
                            ゼロ知識証明とブロックチェーン技術により、プライバシーを保護しながら安全な認証を実現
                        </p>
                    </div>

                    <!-- 使いやすさ -->
                    <div class="text-center p-6">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UIcon name="i-heroicons-device-phone-mobile" class="text-2xl text-green-600" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">簡単操作</h3>
                        <p class="text-gray-600">
                            直感的なUIとQRコードスキャンにより、誰でも簡単にチケットの購入・管理が可能
                        </p>
                    </div>

                    <!-- 透明性 -->
                    <div class="text-center p-6">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UIcon name="i-heroicons-eye" class="text-2xl text-purple-600" />
                        </div>
                        <h3 class="text-xl font-semibold mb-2">完全な透明性</h3>
                        <p class="text-gray-600">
                            すべての取引が記録され、チケットの真正性と履歴を完全に追跡可能
                        </p>
                    </div>
                </div>
            </section>

            <!-- 注目のイベント -->
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold mb-4">注目のイベント</h2>
                <p class="text-gray-600">開催予定の人気イベントをチェック</p>
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

            <div class="text-center mt-8">
                <NuxtLink 
                    to="/events"
                    class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    すべてのイベントを見る
                </NuxtLink>
            </div>
        </main>

        <!-- CTA セクション -->
        <section class="py-16 bg-blue-600 text-white">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-4">今すぐ始めよう</h2>
                <p class="text-xl mb-8 opacity-90">
                    安全で便利なチケット管理システムを体験してください
                </p>
                <div class="space-x-4">
                    <UButton 
                        v-if="status !== 'authenticated'"
                        @click="signIn('github')"
                        color="white"
                        size="lg"
                    >
                        アカウント作成
                    </UButton>
                    <NuxtLink 
                        v-else
                        to="/admin/dashboard"
                        class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        ダッシュボードへ
                    </NuxtLink>
                </div>
            </div>
        </section>
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