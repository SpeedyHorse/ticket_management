import { SiweMessage } from 'siwe'
import Joi from 'joi'

const verifySchema = Joi.object({
  message: Joi.string().required(),
  signature: Joi.string().required()
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

    const { message, signature } = value

    // SIWEメッセージをパース
    const siweMessage = new SiweMessage(message)
    
    // 署名を検証
    const fields = await siweMessage.verify({ signature })
    
    if (!fields.success) {
      throw createError({
        statusCode: 401,
        statusMessage: '署名の検証に失敗しました'
      })
    }

    // セッション情報を作成
    const session = {
      address: siweMessage.address,
      chainId: siweMessage.chainId,
      domain: siweMessage.domain,
      issuedAt: siweMessage.issuedAt,
      expirationTime: siweMessage.expirationTime
    }

    return {
      success: true,
      session,
      address: siweMessage.address
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'SIWE認証処理中にエラーが発生しました'
    })
  }
})