<!-- params: organizerId -->
<script setup lang="ts">
import type { Event } from "@prisma/client"

const { getEventsByOrganizerId, getAllEvents, deleteEvent } = useEvent()

const props = defineProps({
    organizerId: {
        type: String,
        default: ''
    },
})

const selectedEvent = defineModel("selectedEvent")
const phase = defineModel("phase")

const events = ref<Event[]>([])
const loading = ref(true)

async function getEvents() {
    events.value = []
    if (props.organizerId) {
        const organizerEvents = await getEventsByOrganizerId(props.organizerId)
        if (organizerEvents.length > 0) {
            events.value = JSON.parse(JSON.stringify(organizerEvents))
        } else {
            events.value = []
        }
    } else {
        const allEvents = await getAllEvents()
        if (allEvents.length > 0) {
            events.value = JSON.parse(JSON.stringify(allEvents))
        } else {
            events.value = []
        }
    }
}

onMounted(async () => {
    await getEvents()
    loading.value = false
})

const updateEvent = (event: Event) => {
    selectedEvent.value = event
    phase.value = 3
}

const callDeleteEvent = async (id: string) => {
    await deleteEvent(id)
    // refresh events
    await getEvents()
}

</script>

<template>
    <div v-if="loading" class="flex justify-center items-center h-full">
        <p class="text-gray-500 text-lg">Loading...</p>
    </div>
    <div v-else-if="events && events.length === 0" class="flex justify-center items-center h-full">
        <p class="text-red-500 text-lg">No events found</p>
    </div>
    <div v-else>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Your Events</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
            v-for="event in events" :key="event.id"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            @click="navigateTo(`/events/${event.id}`)"
            >
                <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ event.title }}</h3>
                <div class="space-y-2">
                    <p class="text-gray-600">
                        <span class="font-medium">Description:</span> {{ event.description }}
                    </p>
                    <p class="text-gray-600">
                        <span class="font-medium">Venue:</span> {{ event.venue }}
                    </p>
                </div>
                <button
                    class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                    @click="() => updateEvent(event)">
                    update
                </button>
                <button
                    class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                    @click="() => callDeleteEvent(event.id)">
                    delete
                </button>
            </div>
        </div>
    </div>
</template>