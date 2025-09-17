import { PrismaClient } from '@prisma/client'
import { createHash, createCipheriv, randomBytes } from 'crypto'
import QRCode from 'qrcode'

const prisma = new PrismaClient()

// 暗号化キー（実際の本番環境では環境変数から取得）
const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'your-32-character-secret-key-here'
const ALGORITHM = 'aes-256-gcm'

export default defineEventHandler(async (event) => {
  try {
    const ticketId = getRouterParam(event, 'id')
    
    if (!ticketId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'チケットIDが必要です'
      })
    }

    // チケット情報を取得
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            venue: true
          }
        }
      }
    })

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: 'チケットが見つかりません'
      })
    }

    // QRコード用のデータを作成
    const qrData = {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      eventId: ticket.event.id,
      eventTitle: ticket.event.title,
      userEmail: ticket.user.email,
      timestamp: Date.now(),
      expiresAt: new Date(ticket.event.startDate).getTime() + (24 * 60 * 60 * 1000) // イベント開始から24時間後
    }

    // データを暗号化
    const encryptedData = encryptQRData(JSON.stringify(qrData))
    
    // QRコードを生成
    const qrCodeDataURL = await QRCode.toDataURL(encryptedData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // 検証用ハッシュを生成
    const verificationHash = createHash('sha256')
      .update(`${ticket.id}-${ticket.ticketNumber}-${qrData.timestamp}`)
      .digest('hex')

    return {
      success: true,
      qrCode: qrCodeDataURL,
      verificationHash,
      expiresAt: new Date(qrData.expiresAt),
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        event: ticket.event
      }
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'QRコードの生成に失敗しました'
    })
  }
})

// データ暗号化関数
function encryptQRData(data: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // IV + AuthTag + 暗号化データを結合
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}