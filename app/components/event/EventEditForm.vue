<script setup lang="ts">
import Joi from "joi";
import type { FormSubmitEvent } from '@nuxt/ui';
import type { Event } from "@prisma/client";

interface Props {
  eventId: string
}

const props = defineProps<Props>()
const { updateEvent, getEventById } = useEvent()

const loading = ref(true)
const event = ref<Event | null>(null)

const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    venue: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    price: Joi.number().required(),
    totalTickets: Joi.number().required(),
})

const state = reactive({
    title: "",
    description: "",
    venue: "",
    startDate: "",
    endDate: "",
    price: 0,
    totalTickets: 0,
})

const loadEvent = async () => {
  try {
    loading.value = true
    event.value = await getEventById(props.eventId)
    
    if (event.value) {
      // Populate form with existing data
      state.title = event.value.title
      state.description = event.value.description
      state.venue = event.value.venue
      state.startDate = new Date(event.value.startDate).toISOString().split('T')[0]
      state.endDate = new Date(event.value.endDate).toISOString().split('T')[0]
      state.price = Number(event.value.price)
      state.totalTickets = event.value.totalTickets
    }
  } catch (error) {
    console.error('Failed to load event:', error)
  } finally {
    loading.value = false
  }
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
    console.log(event.data)
    if (new Date(event.data.startDate) > new Date(event.data.endDate)) {
        console.log("Start date must be before end date")
        return
    }
    
    try {
        const result = await updateEvent(props.eventId, event.data)
        if (result) {
            navigateTo('/admin/dashboard')
        }
    } catch (error: any) {
        console.error("Failed to update event:", error)
        alert(error.data?.message || 'Failed to update event')
    }
}

onMounted(() => {
  loadEvent()
})
</script>

<template>
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="!event" class="text-center py-8 text-red-500">
      Event not found
    </div>
    
    <UForm v-else :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <UFormField label="Title" name="title">
            <UInput v-model="state.title" />
        </UFormField>
        
        <UFormField label="Description" name="description">
            <UTextarea v-model="state.description" />
        </UFormField>
        
        <UFormField label="Venue" name="venue">
            <UInput v-model="state.venue" />
        </UFormField>
        
        <div class="grid grid-cols-2 gap-4">
            <UFormField label="Start Date" name="startDate">
                <UInput v-model="state.startDate" type="date" />
            </UFormField>
            <UFormField label="End Date" name="endDate">
                <UInput v-model="state.endDate" type="date" />
            </UFormField>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
            <UFormField label="Price (¥)" name="price">
                <UInput v-model="state.price" type="number" min="0" />
            </UFormField>
            <UFormField label="Total Tickets" name="totalTickets">
                <UInput v-model="state.totalTickets" type="number" min="1" />
            </UFormField>
        </div>
        
        <div class="flex space-x-4">
            <UButton type="submit" color="primary">
                Update Event
            </UButton>
            <UButton @click="navigateTo('/admin/dashboard')" variant="outline">
                Cancel
            </UButton>
        </div>
    </UForm>
</template>