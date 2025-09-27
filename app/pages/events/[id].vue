<template>
    <div class="p-6">
        <h1 class="text-3xl font-bold mb-4">Event</h1>
        <div v-if="loading" class="flex justify-center items-center h-full">
            <p class="text-gray-500 text-lg">Loading...</p>
        </div>
        <div v-else-if="event" class="space-y-4">
            <h2 class="text-2xl font-semibold text-gray-800">{{ event.title }}</h2>
            <p class="text-gray-700"><span class="font-medium">Description:</span> {{ event.description }}</p>
            <p class="text-gray-700"><span class="font-medium">Venue:</span> {{ event.venue }}</p>
            <p class="text-gray-700"><span class="font-medium">Start Date:</span> {{ event.startDate }}</p>
            <p class="text-gray-700"><span class="font-medium">End Date:</span> {{ event.endDate }}</p>
            <p class="text-gray-700"><span class="font-medium">Price:</span> {{ event.price }}</p>
            <p class="text-gray-700"><span class="font-medium">Total Tickets:</span> {{ event.totalTickets }}</p>
            <p class="text-gray-700"><span class="font-medium">Available Tickets:</span> {{ event.availableTickets }}</p>
            <p class="text-gray-700"><span class="font-medium">Organizer ID:</span> {{ event.organizerId }}</p>
            <p class="text-gray-700"><span class="font-medium">Status:</span> {{ event.status }}</p>
            <p class="text-gray-700"><span class="font-medium">Event Type:</span> {{ event.eventType }}</p>
            <p class="text-gray-700"><span class="font-medium">Created At:</span> {{ event.createdAt }}</p>
            <p class="text-gray-700"><span class="font-medium">Updated At:</span> {{ event.updatedAt }}</p>
        </div>
        <div v-else class="text-center">
            <p class="text-red-500 text-lg">Event not found</p>
            <p><a href="/" class="text-blue-500 hover:underline">← Back to Dashboard</a></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Event } from '@prisma/client';
import { useRoute } from 'vue-router';


const { getEvent } = useEvent()
const route = useRoute()

const error = ref<string | null>(null)
const loading = ref<boolean>(true)
// const event = ref<Event | null>(null)

definePageMeta({
    validate: async (route) => {
        return typeof route.params.id == 'string';
    }
})

const { data: event } = await useAsyncData('event', () => getEvent(route.params.id as string))

onMounted(async () => {
    if (route.params.id) {
        const dbEvent = await getEvent(route.params.id as string)
        if (dbEvent) {
            event.value = dbEvent
        } else {
            error.value = null
        }
    }
    loading.value = false
})

</script>

