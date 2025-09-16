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

