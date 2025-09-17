import type { Ticket, Event } from '@prisma/client'

export interface TicketIncludeEvent extends Ticket {
    event: Event
}