export default defineEventHandler(async (event) => {
    // エラーハンドリングミドルウェア
    // すべてのAPIリクエストに対してエラーハンドリングを適用
    
    try {
        // 次のハンドラーに処理を委譲
        return
    } catch (error: any) {
        console.error('API Error:', error)
        
        // 既にHTTPエラーの場合はそのまま投げる
        if (error.statusCode) {
            throw error
        }
        
        // 予期しないエラーの場合は500エラーとして処理
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            data: {
                message: process.env.NODE_ENV === 'development' ? error.message : 'サーバーエラーが発生しました'
            }
        })
    }
})