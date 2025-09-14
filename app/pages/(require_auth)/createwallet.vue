<script setup lang="ts">
definePageMeta({
    middleware: 'do-not-have-wallet'
})

import Joi from "joi"
import type { FormSubmitEvent } from "@nuxt/ui";
import { useWallet } from "#imports";

const { createWallet } = useWallet();

const schema = Joi.object({
    password: Joi.string().required(),
})

const state = reactive({ password: undefined })
// const toast = useToast()

async function onSubmit(event: FormSubmitEvent<typeof state>) {
    // toast.add({
    //     title: "Wallet created",
    //     description: "Your wallet has been created",
    //     color: "success"
    // })
    console.log(event.data)
    const user = await createWallet(event.data.password!)

    if (user) {
        navigateTo('/')
    }
    // } else {
    //     toast.add({
    //         title: "Failed to create wallet",
    //         description: "Please try again",
    //         color: "error"
    //     })
    // }
}
</script>

<template>
    <div>
        <h1>Create Wallet</h1>
        <p>Create a new wallet for your account</p>
        <UForm :schema="schema" :state="state" @submit="onSubmit">
            <UFormField label="password" name="password">
                <UInput v-model="state.password" />
            </UFormField>
            <UButton type="submit">Create Wallet</UButton>
        </UForm>
    </div>
</template>