import Joi from 'joi'

export const createEventSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'イベント名は3文字以上で入力してください',
            'string.max': 'イベント名は100文字以内で入力してください',
            'any.required': 'イベント名は必須です'
        }),
    
    description: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.min': '説明は10文字以上で入力してください',
            'string.max': '説明は1000文字以内で入力してください',
            'any.required': '説明は必須です'
        }),
    
    venue: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
            'string.min': '会場名は3文字以上で入力してください',
            'string.max': '会場名は200文字以内で入力してください',
            'any.required': '会場名は必須です'
        }),
    
    startDate: Joi.date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.min': '開始日時は現在時刻より後に設定してください',
            'any.required': '開始日時は必須です'
        }),
    
    endDate: Joi.date()
        .iso()
        .greater(Joi.ref('startDate'))
        .required()
        .messages({
            'date.greater': '終了日時は開始日時より後に設定してください',
            'any.required': '終了日時は必須です'
        }),
    
    price: Joi.number()
        .min(0)
        .max(1000000)
        .required()
        .messages({
            'number.min': '価格は0円以上で設定してください',
            'number.max': '価格は1,000,000円以下で設定してください',
            'any.required': '価格は必須です'
        }),
    
    totalTickets: Joi.number()
        .integer()
        .min(1)
        .max(100000)
        .required()
        .messages({
            'number.min': 'チケット枚数は1枚以上で設定してください',
            'number.max': 'チケット枚数は100,000枚以下で設定してください',
            'any.required': 'チケット枚数は必須です'
        })
})

export const updateEventSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'イベント名は3文字以上で入力してください',
            'string.max': 'イベント名は100文字以内で入力してください'
        }),
    
    description: Joi.string()
        .min(10)
        .max(1000)
        .messages({
            'string.min': '説明は10文字以上で入力してください',
            'string.max': '説明は1000文字以内で入力してください'
        }),
    
    venue: Joi.string()
        .min(3)
        .max(200)
        .messages({
            'string.min': '会場名は3文字以上で入力してください',
            'string.max': '会場名は200文字以内で入力してください'
        }),
    
    startDate: Joi.date()
        .iso()
        .messages({
            'date.base': '有効な日時を入力してください'
        }),
    
    endDate: Joi.date()
        .iso()
        .when('startDate', {
            is: Joi.exist(),
            then: Joi.date().greater(Joi.ref('startDate')),
            otherwise: Joi.date()
        })
        .messages({
            'date.greater': '終了日時は開始日時より後に設定してください'
        }),
    
    price: Joi.number()
        .min(0)
        .max(1000000)
        .messages({
            'number.min': '価格は0円以上で設定してください',
            'number.max': '価格は1,000,000円以下で設定してください'
        }),
    
    totalTickets: Joi.number()
        .integer()
        .min(1)
        .max(100000)
        .messages({
            'number.min': 'チケット枚数は1枚以上で設定してください',
            'number.max': 'チケット枚数は100,000枚以下で設定してください'
        }),
    
    status: Joi.string()
        .valid('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')
        .messages({
            'any.only': '無効なステータスです'
        })
})

export function validateEventData(data: any, schema: Joi.ObjectSchema) {
    const { error, value } = schema.validate(data, { 
        abortEarly: false,
        stripUnknown: true 
    })
    
    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }))
        
        throw createError({
            statusCode: 400,
            statusMessage: "バリデーションエラー",
            data: { errors }
        })
    }
    
    return value
}