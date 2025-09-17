<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavigation />
    <main>
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
// レイアウト用のメタデータ
useHead({
  titleTemplate: '%s - チケット管理システム',
  meta: [
    { name: 'description', content: 'セキュアなチケット管理システム' }
  ]
})
</script>