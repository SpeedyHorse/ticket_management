<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { getUser } = useUser()
const user = ref(null)

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
      <h1 class="text-3xl font-bold text-gray-900">Create New Event</h1>
      <p class="text-gray-600 mt-2">Fill in the details for your new event</p>
    </div>

    <div class="max-w-2xl">
      <EventForm />
    </div>
  </div>
</template>