import { PrismaClient } from '@prisma/client'
import { createHash, randomBytes } from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const count = parseInt(query.count as string) || 3
    const difficulty = query.difficulty as string
    const category = query.category as string

    // フィルター条件を構築
    const where: any = { isActive: true }
    if (difficulty) where.difficulty = difficulty
    if (category) where.category = category

    // 有効な質問テンプレートを取得
    const availableTemplates = await prisma.questionTemplate.findMany({
      where
    })

    if (availableTemplates.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '条件に合う質問が見つかりません'
      })
    }

    // セキュアなランダム選択アルゴリズム
    const selectedQuestions = secureRandomSelection(availableTemplates, count)

    return {
      data: {
        questions: selectedQuestions,
        totalAvailable: availableTemplates.length
      }
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '質問の選択に失敗しました'
    })
  }
})

// セキュアなランダム選択関数
function secureRandomSelection<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return shuffleArray([...array])
  }

  const selected: T[] = []
  const indices = new Set<number>()
  
  while (selected.length < count) {
    // 暗号学的に安全な乱数を生成
    const randomBuffer = randomBytes(4)
    const randomValue = randomBuffer.readUInt32BE(0)
    const index = randomValue % array.length
    
    if (!indices.has(index)) {
      indices.add(index)
      selected.push(array[index])
    }
  }
  
  return selected
}

// Fisher-Yates シャッフルアルゴリズム（セキュア版）
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  
  for (let i = result.length - 1; i > 0; i--) {
    const randomBuffer = randomBytes(4)
    const randomValue = randomBuffer.readUInt32BE(0)
    const j = randomValue % (i + 1)
    
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  
  return result
}