import { getEventWithTicketCount } from "@@/lib/db/event"

export default defineEventHandler(async (event) => {
    // URLから直接IDを抽出
    const url = getRequestURL(event)
    const pathSegments = url.pathname.split('/')
    const eventId = pathSegments[pathSegments.length - 1]
    
    console.log('URL:', url.pathname, 'Extracted eventId:', eventId)
    
    if (!eventId || eventId === 'undefined' || eventId === '') {
        throw createError({
            statusCode: 400,
            statusMessage: "イベントIDが必要です"
        })
    }

    try {
        const eventData = await getEventWithTicketCount(eventId)
        
        return {
            success: true,
            data: eventData
        }
    } catch (error: any) {
        console.error('Error fetching event:', error)
        
        if (error.statusCode === 404) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || "イベントの取得に失敗しました"
        })
    }
})