import { EventStatus } from "@prisma/client"
import prisma from "../prisma"

interface createEventParams {
    title: string,
    description: string,
    venue: string,
    startDate: Date,
    endDate: Date,
    price: number,
    totalTickets: number,
    organizerId: string
}

export async function createEvent(event: createEventParams) {
    return await prisma.event.create({
        data: { 
            ...event, 
            status: EventStatus.DRAFT,
            availableTickets: event.totalTickets
        }
    })
}

