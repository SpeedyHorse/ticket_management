import { EventStatus } from "@prisma/client"
import prisma from "../prisma"

interface createEventParams {
    title: string,
    description: string,
    venue: string,
    startDate: string,
    endDate: string,
    price: number,
    totalTickets: number,
    organizerId: string
}

interface EventFilters {
    status?: EventStatus,
    organizerId?: string,
    startDateFrom?: Date,
    startDateTo?: Date
}

interface getEventsByParamsParams {
    id?: string,
    organizerId?: string,
    status?: EventStatus
}

export async function createEvent(event: createEventParams) {
    const startDate = new Date(event.startDate).toISOString()
    const endDate = new Date(event.endDate).toISOString()
    if (startDate > endDate) {
        throw new Error("Start date must be before end date")
    }

    const data = {
        startDate,
        endDate,
        status: EventStatus.DRAFT,
        availableTickets: event.totalTickets,
        organizerId: event.organizerId,
        title: event.title,
        description: event.description,
        venue: event.venue,
        price: event.price,
        totalTickets: event.totalTickets,
    }

    return await prisma.event.create({
        data: { ...data }
    })
}

export async function getEvent(id: string) {
    const event =  await prisma.event.findUnique({
        where: { id }
    })
    if (!event) {
        throw createError({
            statusCode: 404,
            statusMessage: "Event not found"
        })
    }
    return event
}

export async function getEvents() {
    const events = await prisma.event.findMany()
    return events
}

export async function getEventsByOrganizerId(organizerId: string) {
    const events = await prisma.event.findMany({
        where: { organizerId }
    })
    return events
}

export async function getEventsByParams(params: getEventsByParamsParams) {
    // const { id, organizerId, status } = params
    return await prisma.event.findMany({
        where: params
    })
}

interface updateEventParams {
    title?: string,
    description?: string,
    venue?: string,
    startDate?: string,
    endDate?: string,
    price?: number,
    totalTickets?: number,
    status?: EventStatus
}

export async function updateEvent(id: string, updates: updateEventParams) {
    const existingEvent = await getEvent(id)
    
    // Validate date logic if dates are being updated
    if (updates.startDate || updates.endDate) {
        const startDate = updates.startDate ? new Date(updates.startDate) : existingEvent.startDate
        const endDate = updates.endDate ? new Date(updates.endDate) : existingEvent.endDate
        
        if (startDate > endDate) {
            throw new Error("Start date must be before end date")
        }
    }

    // Handle ticket count changes
    if (updates.totalTickets !== undefined) {
        const soldTickets = existingEvent.totalTickets - existingEvent.availableTickets
        if (updates.totalTickets < soldTickets) {
            throw new Error("Cannot reduce total tickets below already sold tickets")
        }
        updates.availableTickets = updates.totalTickets - soldTickets
    }

    const updateData = {
        ...updates,
        ...(updates.startDate && { startDate: new Date(updates.startDate).toISOString() }),
        ...(updates.endDate && { endDate: new Date(updates.endDate).toISOString() })
    }

    return await prisma.event.update({
        where: { id },
        data: updateData
    })
}

export async function deleteEvent(id: string) {
    const event = await getEvent(id)
    
    // Check if event has sold tickets
    const soldTickets = event.totalTickets - event.availableTickets
    if (soldTickets > 0) {
        throw new Error("Cannot delete event with sold tickets")
    }

    return await prisma.event.delete({
        where: { id }
    })
}

export async function updateEventStatus(id: string, status: EventStatus) {
    return await prisma.event.update({
        where: { id },
        data: { status }
    })
}

export async function getPublishedEvents() {
    return await prisma.event.findMany({
        where: { 
            status: EventStatus.PUBLISHED,
            startDate: {
                gte: new Date() // Only future events
            }
        },
        orderBy: {
            startDate: 'asc'
        }
    })
}

export async function getEventWithTicketCount(id: string) {
    const event = await getEvent(id)
    const soldTickets = event.totalTickets - event.availableTickets
    
    return {
        ...event,
        soldTickets,
        salesPercentage: Math.round((soldTickets / event.totalTickets) * 100)
    }
}
