<script setup lang="ts">
import EventForm from "~/components/event/EventForm.vue";

const phase = ref(1)
</script>


<template>
    <div>
        <div v-if="phase == 1">
            <h1>Organizer Dashboard</h1>
            <button @click="() => phase = 2">Create Event</button>
        </div>
        <div v-if="phase == 2">
            <h1>Create Event</h1>
            <EventForm />
        </div>
    </div>
</template>