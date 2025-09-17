import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const templates = await prisma.questionTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      templates
    }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '質問テンプレートの取得に失敗しました'
    })
  }
})