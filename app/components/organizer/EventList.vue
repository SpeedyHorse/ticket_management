<script setup lang="ts">
import type { Event } from "@prisma/client";

const { getEventsByOrganizerId, deleteEvent, publishEvent, unpublishEvent } = useEvent()
const { getUser } = useUser()

const events = ref<Event[]>([])
const loading = ref(true)
const user = ref(null)

const loadEvents = async () => {
  try {
    loading.value = true
    user.value = await getUser()
    if (user.value?.id) {
      events.value = await getEventsByOrganizerId(user.value.id)
    }
  } catch (error) {
    console.error('Failed to load events:', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (eventId: string) => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await deleteEvent(eventId)
      await loadEvents() // Refresh the list
    } catch (error: any) {
      alert(error.data?.message || 'Failed to delete event')
    }
  }
}

const handlePublish = async (eventId: string) => {
  try {
    await publishEvent(eventId)
    await loadEvents() // Refresh the list
  } catch (error: any) {
    alert(error.data?.message || 'Failed to publish event')
  }
}

const handleUnpublish = async (eventId: string) => {
  try {
    await unpublishEvent(eventId)
    await loadEvents() // Refresh the list
  } catch (error: any) {
    alert(error.data?.message || 'Failed to unpublish event')
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'green'
    case 'DRAFT': return 'yellow'
    case 'CANCELLED': return 'red'
    case 'COMPLETED': return 'blue'
    default: return 'gray'
  }
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadEvents()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">My Events</h2>
      <UButton to="/admin/events/create" color="primary">
        Create New Event
      </UButton>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="events.length === 0" class="text-center py-8 text-gray-500">
      No events found. Create your first event to get started.
    </div>

    <div v-else class="grid gap-4">
      <UCard v-for="event in events" :key="event.id" class="hover:shadow-lg transition-shadow">
        <template #header>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ event.title }}</h3>
              <p class="text-sm text-gray-600">{{ event.venue }}</p>
            </div>
            <UBadge :color="getStatusColor(event.status)" variant="soft">
              {{ event.status }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-2">
          <p class="text-sm text-gray-700">{{ event.description }}</p>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Start:</span> {{ formatDate(event.startDate) }}
            </div>
            <div>
              <span class="font-medium">End:</span> {{ formatDate(event.endDate) }}
            </div>
            <div>
              <span class="font-medium">Price:</span> ¥{{ event.price }}
            </div>
            <div>
              <span class="font-medium">Tickets:</span> 
              {{ event.availableTickets }}/{{ event.totalTickets }} available
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center">
            <div class="flex space-x-2">
              <UButton 
                :to="`/admin/events/${event.id}/edit`" 
                size="sm" 
                variant="outline"
              >
                Edit
              </UButton>
              
              <UButton 
                v-if="event.status === 'DRAFT'" 
                @click="handlePublish(event.id)"
                size="sm" 
                color="green"
              >
                Publish
              </UButton>
              
              <UButton 
                v-if="event.status === 'PUBLISHED'" 
                @click="handleUnpublish(event.id)"
                size="sm" 
                color="yellow"
              >
                Unpublish
              </UButton>
            </div>

            <div class="flex space-x-2">
              <UButton 
                :to="`/admin/events/${event.id}/report`" 
                size="sm" 
                variant="ghost"
              >
                View Report
              </UButton>
              
              <UButton 
                @click="handleDelete(event.id)"
                size="sm" 
                color="red" 
                variant="outline"
                :disabled="event.totalTickets - event.availableTickets > 0"
              >
                Delete
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>