<script setup lang="ts">
import { useUser } from "#imports"
import { Role } from "@prisma/client"
import OrgDashboard from "~/sections/organizer/OrgDashboard.vue"
import CusDashboard from "~/sections/customer/CusDashboard.vue"

definePageMeta({
    middleware: 'auth'
})
const { getUserRole } = useUser()

const role = ref<Role | null>(null)
const loading = ref(true)

onMounted(async () => {
    role.value = await getUserRole()
    loading.value = false
})
</script>

<template>
    <div>
        <h1>Dashboard</h1>
        <div v-if="loading">
            <p>Loading...</p>
        </div>
        <div v-else>
            <div>{{ role }}:{{ role === Role.CUSTOMER }}</div>
            <div v-if="role === Role.ORGANIZER">
                <p>Organizer</p>
                <OrgDashboard />
            </div>
            <div v-else-if="role === Role.ADMIN">
                <p>Admin</p>
                <OrgDashboard />
            </div>
            <div v-else-if="role === Role.STAFF">
                <p>Staff</p>
            </div>
            <div v-else-if="role === Role.CUSTOMER">
                <p>Customer</p>
                <CusDashboard />
            </div>
            <OrgDashboard />
        </div>
    </div>
</template>