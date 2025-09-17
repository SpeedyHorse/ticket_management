import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 12
    const status = query.status as string || 'PUBLISHED'
    const search = query.search as string
    const category = query.category as string
    const startDate = query.startDate as string
    const priceRange = query.priceRange as string
    const featured = query.featured as string

    // フィルター条件を構築
    const where: any = { status }
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    if (category) {
      where.category = category
    }
    
    if (startDate) {
      where.startDate = {
        gte: new Date(startDate)
      }
    }

    // 価格帯フィルター
    if (priceRange) {
      switch (priceRange) {
        case 'free':
          where.price = 0
          break
        case 'low':
          where.price = { lte: 5000 }
          break
        case 'medium':
          where.price = { gte: 5000, lte: 15000 }
          break
        case 'high':
          where.price = { gte: 15000 }
          break
      }
    }

    // 注目イベントフィルター
    if (featured === 'true') {
      where.featured = true
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
      orderBy: [
        { startDate: 'asc' }
      ],
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
      data: eventsWithStats,
      events: eventsWithStats, // 互換性のため
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    }

  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'イベント一覧の取得に失敗しました'
    })
  }
})