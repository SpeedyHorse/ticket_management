<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">質問テンプレート管理</h1>
      <p class="text-gray-600">セキュリティ質問のテンプレートを管理します。</p>
    </div>

    <QuestionTemplateManager />
  </div>
</template>

<script setup>
useHead({
  title: '質問テンプレート管理'
})
</script>