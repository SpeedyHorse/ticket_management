<script setup lang="ts">
const { signIn, status, signOut } = useAuth()
</script>

<template>
    <div>
        <p>hello</p>
        <div>
            <NuxtLink to="/protected">protected</NuxtLink>
        </div>
        <div v-if="status == 'authenticated'">
            <p>hello, {{status}}</p>
            <button @click="() => signOut()">
                sign out
            </button>
        </div>
        <button v-else @click="() => signIn('github')">
            Sign In
        </button>
    </div>
</template>