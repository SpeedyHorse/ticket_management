<script setup lang="ts">
import EventForm from "~/components/event/EventForm.vue";
import type { User, Event } from "@prisma/client";

const { getEventsByOrganizerId, deleteEvent } = useEvent()
const { getUser } = useUser()

const user = ref<User | null>(null)
const events = ref<Event[] | null>([])
const selectedEvent = ref<Event | undefined>(undefined)

async function getEvents() {
    events.value = null
    const bEvents = await getEventsByOrganizerId(user.value!.id!)
    if (bEvents.length > 0) {
        events.value = JSON.parse(JSON.stringify(bEvents))
    }
}

onMounted(async () => {
    user.value = await getUser()
    await getEvents()
})

// 1: Dashboard
// 2: Create Event
// 3: Update Event
const phase = ref(1)

const createEvent = () => {
    selectedEvent.value = undefined
    phase.value = 2
}

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
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-6xl mx-auto">
            <!-- Phase 1: Dashboard -->
            <div v-if="phase == 1" class="space-y-8">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h1 class="text-3xl font-bold text-gray-900 mb-6">Organizer Dashboard</h1>
                    
                    <div class="flex flex-wrap gap-4 mb-8">
                        <button 
                            @click="() => createEvent()"
                            class="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                        >
                            Create Event
                        </button>
                        <button 
                            v-if="user" 
                            @click="() => getEvents()"
                            class="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                        >
                            Get Events
                        </button>
                    </div>
                </div>

                <!-- Events List -->
                <div v-if="events != null && events.length > 0" class="space-y-4">
                    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Your Events</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div 
                            v-for="event in events" 
                            :key="event.id"
                            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
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
                                @click="() => updateEvent(event)"
                            >
                                update
                            </button>
                            <button
                                class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                                @click="() => callDeleteEvent(event.id)"
                            >
                                delete
                            </button>
                        </div>
                    </div>
                </div>

                <!-- No Events Message -->
                <div v-else-if="events != null && events.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p class="text-gray-500 text-lg">No events found. Create your first event!</p>
                </div>
            </div>

            <!-- Phase 2: Create Event -->
            <div v-if="phase == 2" class="space-y-6">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h1 class="text-3xl font-bold text-gray-900">Create Event</h1>
                        <button 
                            @click="() => phase = 1"
                            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                    <EventForm :event="selectedEvent" type="create" />
                </div>
            </div>

            <!-- Phase 3: Update Event -->
            <div v-if="phase == 3" class="space-y-6">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h1 class="text-3xl font-bold text-gray-900">Update Event</h1>
                </div>
                <EventForm :event="selectedEvent" type="update" />
            </div>
        </div>
    </div>
</template>