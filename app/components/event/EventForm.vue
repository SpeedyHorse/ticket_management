<script setup lang="ts">
import Joi from "joi";
import type { FormSubmitEvent } from '@nuxt/ui';
import type { User } from "@prisma/client";

const { getUser } = useUser()
const { createEvent } = useEvent()

const user = ref<User | null>(null)


onMounted(async () => {
    user.value = await getUser()
    console.log("user", user.value)
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

const state = reactive({
    title: "",
    description: "",
    venue: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    price: 0,
    totalTickets: 0,
})

async function onSubmit(event: FormSubmitEvent<typeof state>) {
    console.log(event.data)
    if (event.data.startDate > event.data.endDate) {
        console.log("Start date must be before end date")
        return
    }
    const result = await createEvent({
        ...event.data,
        organizerId: user.value?.id!
    })
    if (result) {
        navigateTo('/')
    } else {
        console.log("Failed to create event")
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
        <UButton type="submit">Create Event</UButton>
    </UForm>
</template>