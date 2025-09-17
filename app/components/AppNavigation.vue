<template>
  <nav class="bg-white shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <!-- ロゴ -->
        <NuxtLink to="/" class="text-xl font-bold text-blue-600">
          チケット管理システム
        </NuxtLink>

        <!-- メインナビゲーション -->
        <div class="hidden md:flex space-x-6">
          <NuxtLink 
            to="/events"
            class="text-gray-700 hover:text-blue-600 transition-colors"
            :class="{ 'text-blue-600 font-semibold': $route.path.startsWith('/events') }"
          >
            イベント一覧
          </NuxtLink>
          
          <NuxtLink 
            to="/tickets"
            class="text-gray-700 hover:text-blue-600 transition-colors"
            :class="{ 'text-blue-600 font-semibold': $route.path.startsWith('/tickets') }"
          >
            マイチケット
          </NuxtLink>

          <!-- 管理者メニュー -->
          <div v-if="isAdmin" class="relative" @click="toggleAdminMenu">
            <button class="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
              管理者
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div v-if="showAdminMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <NuxtLink 
                to="/admin/events"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showAdminMenu = false"
              >
                イベント管理
              </NuxtLink>
              <NuxtLink 
                to="/admin/questions"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showAdminMenu = false"
              >
                質問管理
              </NuxtLink>
              <NuxtLink 
                to="/admin/dashboard"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showAdminMenu = false"
              >
                ダッシュボード
              </NuxtLink>
            </div>
          </div>

          <!-- スタッフメニュー -->
          <div v-if="isStaff" class="relative" @click="toggleStaffMenu">
            <button class="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
              スタッフ
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div v-if="showStaffMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <NuxtLink 
                to="/staff/scanner"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showStaffMenu = false"
              >
                QRスキャナー
              </NuxtLink>
              <NuxtLink 
                to="/staff/zk-verifier"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showStaffMenu = false"
              >
                ZK証明検証
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- ユーザーメニュー -->
        <div class="flex items-center space-x-4">
          <div v-if="user" class="relative" @click="toggleUserMenu">
            <button class="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              {{ user.name || user.email }}
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <NuxtLink 
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showUserMenu = false"
              >
                プロフィール
              </NuxtLink>
              <button 
                @click="logout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                ログアウト
              </button>
            </div>
          </div>
          
          <NuxtLink 
            v-else
            to="/auth/login"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ログイン
          </NuxtLink>
        </div>

        <!-- モバイルメニューボタン -->
        <button 
          @click="toggleMobileMenu"
          class="md:hidden text-gray-700 hover:text-blue-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- モバイルメニュー -->
      <div v-if="showMobileMenu" class="md:hidden py-4 border-t">
        <div class="space-y-2">
          <NuxtLink 
            to="/events"
            class="block py-2 text-gray-700 hover:text-blue-600"
            @click="showMobileMenu = false"
          >
            イベント一覧
          </NuxtLink>
          <NuxtLink 
            to="/tickets"
            class="block py-2 text-gray-700 hover:text-blue-600"
            @click="showMobileMenu = false"
          >
            マイチケット
          </NuxtLink>
          
          <div v-if="isAdmin" class="border-t pt-2">
            <p class="text-sm font-semibold text-gray-500 mb-2">管理者</p>
            <NuxtLink 
              to="/admin/events"
              class="block py-2 pl-4 text-gray-700 hover:text-blue-600"
              @click="showMobileMenu = false"
            >
              イベント管理
            </NuxtLink>
            <NuxtLink 
              to="/admin/questions"
              class="block py-2 pl-4 text-gray-700 hover:text-blue-600"
              @click="showMobileMenu = false"
            >
              質問管理
            </NuxtLink>
          </div>
          
          <div v-if="isStaff" class="border-t pt-2">
            <p class="text-sm font-semibold text-gray-500 mb-2">スタッフ</p>
            <NuxtLink 
              to="/staff/scanner"
              class="block py-2 pl-4 text-gray-700 hover:text-blue-600"
              @click="showMobileMenu = false"
            >
              QRスキャナー
            </NuxtLink>
            <NuxtLink 
              to="/staff/zk-verifier"
              class="block py-2 pl-4 text-gray-700 hover:text-blue-600"
              @click="showMobileMenu = false"
            >
              ZK証明検証
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const { data } = useAuth()
const user = computed(() => data.value?.user)

const showAdminMenu = ref(false)
const showStaffMenu = ref(false)
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

// 仮の権限チェック（実際は認証システムから取得）
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.email?.includes('admin'))
const isStaff = computed(() => user.value?.role === 'staff' || isAdmin.value)

const toggleAdminMenu = () => {
  showAdminMenu.value = !showAdminMenu.value
  showStaffMenu.value = false
  showUserMenu.value = false
}

const toggleStaffMenu = () => {
  showStaffMenu.value = !showStaffMenu.value
  showAdminMenu.value = false
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showAdminMenu.value = false
  showStaffMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const logout = async () => {
  // ログアウト処理
  await navigateTo('/auth/logout')
}

// クリック外でメニューを閉じる
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showAdminMenu.value = false
      showStaffMenu.value = false
      showUserMenu.value = false
    }
  })
})
</script>