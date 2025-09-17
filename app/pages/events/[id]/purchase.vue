<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <NuxtLink 
        :to="`/events/${$route.params.id}`"
        class="text-blue-600 hover:underline flex items-center"
      >
        ← イベント詳細に戻る
      </NuxtLink>
    </div>

    <TicketPurchase 
      :event-id="$route.params.id"
      @view-tickets="navigateToTickets"
    />
  </div>
</template>

<script setup>
const route = useRoute()

const navigateToTickets = () => {
  navigateTo('/tickets')
}

// メタデータ設定
useHead({
  title: 'チケット購入'
})
</script>