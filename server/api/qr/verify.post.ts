import Joi from 'joi'
import { PrismaClient } from '@prisma/client'
import { createDecipheriv, createHash } from 'crypto'

const prisma = new PrismaClient()

// 暗号化キー（実際の本番環境では環境変数から取得）
const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'your-32-character-secret-key-here'
const ALGORITHM = 'aes-256-gcm'

const verifySchema = Joi.object({
  qrData: Joi.string().required(),
  eventId: Joi.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = verifySchema.validate(body)
    
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    const { qrData, eventId } = value

    // QRコードデータを復号化
    let decryptedData
    try {
      decryptedData = JSON.parse(decryptQRData(qrData))
    } catch (decryptError) {
      throw createError({
        statusCode: 400,
        statusMessage: '無効なQRコードです'
      })
    }

    // データの有効性をチェック
    if (decryptedData.expiresAt < Date.now()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'QRコードの有効期限が切れています'
      })
    }

    // イベントIDが指定されている場合はチェック
    if (eventId && decryptedData.eventId !== eventId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'このQRコードは別のイベント用です'
      })
    }

    // チケット情報を取得
    const ticket = await prisma.ticket.findUnique({
      where: { id: decryptedData.ticketId },
      include: {
        event: true
      }
    })

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: 'チケットが見つかりません'
      })
    }

    // チケット番号の一致を確認
    if (ticket.ticketNumber !== decryptedData.ticketNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: 'チケット情報が一致しません'
      })
    }

    // チケットのステータスをチェック
    if (ticket.status === 'USED') {
      return {
        success: false,
        verified: false,
        message: 'このチケットは既に使用済みです',
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          usedAt: ticket.usedAt
        }
      }
    }

    if (ticket.status === 'CANCELLED') {
      return {
        success: false,
        verified: false,
        message: 'このチケットはキャンセルされています',
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status
        }
      }
    }

    // 検証成功
    return {
      success: true,
      verified: true,
      message: 'チケットの検証に成功しました',
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userEmail: ticket.userEmail,
        status: ticket.status,
        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          startDate: ticket.event.startDate,
          venue: ticket.event.venue
        }
      },
      qrData: decryptedData
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'QRコードの検証に失敗しました'
    })
  }
})

// データ復号化関数
function decryptQRData(encryptedData: string): string {
  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]

  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}