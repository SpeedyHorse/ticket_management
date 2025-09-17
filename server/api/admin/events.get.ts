import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const status = query.status as string
    const search = query.search as string
    const startDate = query.startDate as string
    const endDate = query.endDate as string

    // フィルター条件を構築
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) where.startDate.gte = new Date(startDate)
      if (endDate) where.startDate.lte = new Date(endDate)
    }

    // 総件数を取得
    const totalCount = await prisma.event.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    // イベント一覧を取得
    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: { tickets: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // 販売済みチケット数と売上を計算
    const eventsWithStats = events.map(event => ({
      ...event,
      soldTickets: event._count.tickets,
      availableTickets: event.totalTickets - event._count.tickets,
      salesPercentage: Math.round((event._count.tickets / event.totalTickets) * 100)
    }))

    return {
      success: true,
      events: eventsWithStats,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'イベント一覧の取得に失敗しました'
    })
  }
})