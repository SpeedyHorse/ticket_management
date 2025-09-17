<template>
    <footer class="bg-gray-800 text-white mt-16">
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <!-- 会社情報 -->
                <div>
                    <h3 class="text-lg font-semibold mb-4">チケット管理システム</h3>
                    <p class="text-gray-300 text-sm">
                        セキュアで使いやすいチケット管理システムを提供しています。
                    </p>
                </div>

                <!-- サービス -->
                <div>
                    <h4 class="font-semibold mb-4">サービス</h4>
                    <ul class="space-y-2 text-sm">
                        <li>
                            <NuxtLink to="/events" class="text-gray-300 hover:text-white">イベント一覧</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/tickets" class="text-gray-300 hover:text-white">マイチケット</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/help" class="text-gray-300 hover:text-white">ヘルプ</NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- 管理者・スタッフ -->
                <div>
                    <h4 class="font-semibold mb-4">管理者・スタッフ</h4>
                    <ul class="space-y-2 text-sm">
                        <li>
                            <NuxtLink to="/admin/events" class="text-gray-300 hover:text-white">イベント管理</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/staff/scanner" class="text-gray-300 hover:text-white">QRスキャナー</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/staff/zk-verifier" class="text-gray-300 hover:text-white">ZK証明検証</NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- サポート -->
                <div>
                    <h4 class="font-semibold mb-4">サポート</h4>
                    <ul class="space-y-2 text-sm">
                        <li>
                            <NuxtLink to="/contact" class="text-gray-300 hover:text-white">お問い合わせ</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/privacy" class="text-gray-300 hover:text-white">プライバシーポリシー</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/terms" class="text-gray-300 hover:text-white">利用規約</NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
                <p>&copy; 2024 チケット管理システム. All rights reserved.</p>
            </div>
        </div>
    </footer>
</template>