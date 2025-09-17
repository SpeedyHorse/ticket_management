import { generateNonce } from 'siwe'

export default defineEventHandler(async (event) => {
  try {
    const nonce = generateNonce()
    
    return {
      success: true,
      nonce
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ナンス生成中にエラーが発生しました'
    })
  }
})