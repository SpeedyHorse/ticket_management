export const useErrorHandler = () => {
  const toast = useToast()

  const handleError = (error: any, customMessage?: string) => {
    console.error('Error:', error)
    
    let message = customMessage || 'エラーが発生しました'
    
    if (error?.data?.errors) {
      // バリデーションエラーの場合
      const validationErrors = error.data.errors
      message = validationErrors.map((err: any) => err.message).join(', ')
    } else if (error?.data?.message) {
      message = error.data.message
    } else if (error?.message) {
      message = error.message
    }

    toast.add({
      title: 'エラー',
      description: message,
      color: 'red',
      timeout: 5000
    })
  }

  const handleSuccess = (message: string) => {
    toast.add({
      title: '成功',
      description: message,
      color: 'green',
      timeout: 3000
    })
  }

  const handleValidationErrors = (errors: Array<{ field: string, message: string }>) => {
    const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('\n')
    
    toast.add({
      title: 'バリデーションエラー',
      description: errorMessages,
      color: 'red',
      timeout: 7000
    })
  }

  return {
    handleError,
    handleSuccess,
    handleValidationErrors
  }
}