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
