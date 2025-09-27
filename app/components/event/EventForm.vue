<script setup lang="ts">
import Joi from "joi";
import type { FormSubmitEvent } from '@nuxt/ui';
import type { User, Event as EventType } from "@prisma/client";

interface Props {
    type: 'create' | 'update'
}

const selectedEvent = defineModel<EventType>("selectedEvent")

const { getUser } = useUser()
const { createEvent, updateEvent } = useEvent()

const user = ref<User | null>(null)
const mode = ref<'create' | 'update'>('create')

// 日付フォーマット関数
function formatDateForInput(date: string | Date): string {
  const d = new Date(date)
  const returnDate = d.toISOString().split('T')[0]
  if (!returnDate) {
    throw new Error("Failed to format date")
  }
  return returnDate
}

onMounted(async () => {
    user.value = await getUser()
    console.log("user", user.value)
    mode.value = props.type
})

const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    venue: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    price: Joi.number().required(),
    totalTickets: Joi.number().required(),
})

const props = withDefaults(
    defineProps<Props>(),
    {
        selectedEvent: null,
        type: 'create'
    }
)

const state = props.type === 'update' && selectedEvent.value ? reactive({
    title: selectedEvent.value.title,
    description: selectedEvent.value.description,
    venue: selectedEvent.value.venue,
    startDate: formatDateForInput(selectedEvent.value.startDate),
    endDate: formatDateForInput(selectedEvent.value.endDate),
    price: Number(selectedEvent.value.price),
    totalTickets: selectedEvent.value.totalTickets,
}) : reactive({
    title: "",
    description: "",
    venue: "",
    startDate: formatDateForInput(new Date()),
    endDate: formatDateForInput(new Date()),
    price: 0,
    totalTickets: 0,
})

async function onSubmit(event: FormSubmitEvent<typeof state>) {
    console.log(event.data)
    if (event.data.startDate > event.data.endDate) {
        console.log("Start date must be before end date")
        return
    }
    if (mode.value === 'create') {
        const result = await createEvent({
            ...event.data,
            organizerId: user.value?.id!
        })
        if (result) {
            navigateTo('/')
        } else {
            console.log("Failed to create event")
        }
    } else {
        const result = await updateEvent(
            selectedEvent.value?.id!,
            event.data
        )
        if (result) {
            navigateTo('/')
        } else {
            console.log("Failed to update event")
        }
    }
}
</script>

<template>
    <UForm :schema="schema" :state="state" @submit="onSubmit">
        <UFormField label="title" name="title">
            <UInput v-model="state.title" />
        </UFormField>
        <UFormField label="description" name="description">
            <UInput v-model="state.description" />
        </UFormField>
        <UFormField label="venue" name="venue">
            <UInput v-model="state.venue" />
        </UFormField>
        <UFormField label="startDate" name="startDate">
            <UInput v-model="state.startDate" type="date" />
        </UFormField>
        <UFormField label="endDate" name="endDate">
            <UInput v-model="state.endDate" type="date" />
        </UFormField>
        <UFormField label="price" name="price">
            <UInput v-model="state.price" type="number" />
        </UFormField>
        <UFormField label="totalTickets" name="totalTickets">
            <UInput v-model="state.totalTickets" type="number" />
        </UFormField>
        <UButton type="submit">
            {{ mode === 'create' ? 'Create Event' : 'Update Event' }}
        </UButton>
    </UForm>
</template>