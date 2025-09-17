<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { getUser } = useUser()
const user = ref(null)

const eventId = route.params.id as string

onMounted(async () => {
  user.value = await getUser()
  
  // Redirect if not organizer
  if (user.value?.role !== 'ORGANIZER') {
    await navigateTo('/')
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Edit Event</h1>
      <p class="text-gray-600 mt-2">Update your event details</p>
    </div>

    <div class="max-w-2xl">
      <EventEditForm :event-id="eventId" />
    </div>
  </div>
</template>