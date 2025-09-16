<script setup lang="ts">
import EventForm from "~/components/event/EventForm.vue";
import type { User, Event } from "@prisma/client";

const { getEventsByOrganizerId } = useEvent()
const { getUser } = useUser()

const user = ref<User | null>(null)
const events = ref<Event[] | null>([])

async function getEvents() {
    const bEvents = await getEventsByOrganizerId(user.value!.id!)
    if (bEvents.length > 0) {
        events.value = JSON.parse(JSON.stringify(bEvents))
    }
}

onMounted(async () => {
    user.value = await getUser()
})

const phase = ref(1)
</script>


<template>
    <div>
        <div v-if="phase == 1">
            <h1>Organizer Dashboard</h1>
            <button @click="() => phase = 2">Create Event</button>
            <button v-if="user" @click="() => getEvents()">Get Events</button>
            <div v-if="events !=null && events.length > 0">
                <div v-for="event in events" :key="event.id">
                    <h2>{{ event.title }}</h2>
                    <p>description: {{ event.description }}</p>
                    <p>venue: {{ event.venue }}</p>
                </div>
            </div>
        </div>
        <div v-if="phase == 2">
            <h1>Create Event</h1>
            <EventForm />
        </div>
    </div>
</template>