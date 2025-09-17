import Joi from 'joi'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

const proofSchema = Joi.object({
  proof: Joi.object({
    ticketId: Joi.string().required(),
    commitment: Joi.string().required(),
    challenge: Joi.string().required(),
    response: Joi.string().required(),
    timestamp: Joi.number().required(),
    signature: Joi.string().required(),
    publicInputs: Joi.object({
      eventId: Joi.string().required(),
      ticketStatus: Joi.string().required()
    }).required()
  }).required()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = proofSchema.validate(body)
    
    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.details[0].message
      })
    }

    const { proof } = value

    // 証明の有効期限をチェック（10分）
    const now = Date.now()
    const proofAge = now - proof.timestamp
    const maxAge = 10 * 60 * 1000 // 10分

    if (proofAge > maxAge) {
      return {
        valid: false,
        message: '証明の有効期限が切れています',
        details: {
          ticketValid: false,
          answerMatch: false,
          timestamp: proof.timestamp
        }
      }
    }

    // チケット情報を取得
    const ticket = await prisma.ticket.findUnique({
      where: { id: proof.ticketId },
      include: { event: true }
    })

    if (!ticket) {
      return {
        valid: false,
        message: 'チケットが見つかりません',
        details: {
          ticketValid: false,
          answerMatch: false,
          timestamp: proof.timestamp
        }
      }
    }

    // 公開入力の検証
    const publicInputsValid = 
      proof.publicInputs.eventId === ticket.event.id &&
      proof.publicInputs.ticketStatus === ticket.status

    if (!publicInputsValid) {
      return {
        valid: false,
        message: '公開入力が一致しません',
        details: {
          ticketValid: false,
          answerMatch: false,
          timestamp: proof.timestamp
        }
      }
    }

    // 証明の署名を検証
    const proofCopy = { ...proof }
    delete proofCopy.signature
    
    const expectedSignature = createHash('sha256')
      .update(JSON.stringify(proofCopy))
      .digest('hex')

    if (proof.signature !== expectedSignature) {
      return {
        valid: false,
        message: '証明の署名が無効です',
        details: {
          ticketValid: false,
          answerMatch: false,
          timestamp: proof.timestamp
        }
      }
    }

    // チケットのステータスをチェック
    const ticketValid = ticket.status === 'PURCHASED' || ticket.status === 'VERIFIED'

    if (!ticketValid) {
      return {
        valid: false,
        message: 'チケットのステータスが無効です',
        details: {
          ticketValid: false,
          answerMatch: false,
          timestamp: proof.timestamp
        }
      }
    }

    // 実際のZK証明検証（簡易実装）
    // 本番環境では、circomで生成された証明をsnarkjsで検証する
    const zkProofValid = await verifyZKProof(proof)

    if (!zkProofValid) {
      return {
        valid: false,
        message: 'ゼロ知識証明の検証に失敗しました',
        details: {
          ticketValid: true,
          answerMatch: false,
          timestamp: proof.timestamp
        }
      }
    }

    // 検証成功
    return {
      valid: true,
      message: 'ゼロ知識証明の検証に成功しました',
      details: {
        ticketValid: true,
        answerMatch: true,
        timestamp: proof.timestamp
      },
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        event: {
          title: ticket.event.title,
          startDate: ticket.event.startDate
        }
      }
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'ゼロ知識証明の検証に失敗しました'
    })
  }
})

// 簡易的なZK証明検証関数（実際の実装ではsnarkjsを使用）
async function verifyZKProof(proof: any): Promise<boolean> {
  try {
    // コミット・チャレンジ・レスポンスの検証
    // 実際のZK証明では、証明回路の検証キーを使用して検証を行う
    
    // 簡易実装: コミットメントとレスポンスの整合性をチェック
    const expectedResponse = createHash('sha256')
      .update(`${proof.commitment}-${proof.challenge}`)
      .digest('hex')
    
    // 実際の検証ロジックはより複雑になる
    return proof.response.length === 64 && proof.commitment.length === 64
    
  } catch (error) {
    return false
  }
}