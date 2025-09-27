<script setup lang="ts">
import EventForm from "~/components/event/EventForm.vue";
import type { User, Event } from "@prisma/client";

const { getUser } = useUser()

const user = ref<User | null>(null)

const getEventSleep = ref(false)

async function getEvents() {
    getEventSleep.value = true
    loading.value = true
}


// 1: Dashboard
// 2: Create Event
// 3: Update Event
const selectedEvent = ref<Event | null>(null)
const phase = ref(1)
const loading = ref(false)

watch(loading, () => {
    getEventSleep.value = false
    console.log("getEventSleep", getEventSleep.value)
}, { immediate: true })

onMounted(async () => {
    user.value = await getUser()
    phase.value = 1
})


const createEvent = () => {
    selectedEvent.value = null
    phase.value = 2
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
                            :class="{'opacity-50': getEventSleep}"
                            :disabled="getEventSleep"
                        >
                            Get Events
                        </button>
                    </div>
                </div>

                <EventList :organizerId="user?.id" v-model:phase="phase" v-model:selectedEvent="selectedEvent" v-model:loading="loading" />
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
                    <EventForm type="create" />
                </div>
            </div>

            <!-- Phase 3: Update Event -->
            <div v-if="phase == 3" class="space-y-6">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h1 class="text-3xl font-bold text-gray-900">Update Event</h1>
                </div>
                <EventForm v-model:selectedEvent="selectedEvent!" type="update" />
            </div>
        </div>
    </div>
</template>