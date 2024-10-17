import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
    MONGODB: Joi.required(),//localhost:27017/nest-pokemon 
    PORT: Joi.number().default(3000),
    DEFAULT_LIMIT: Joi.number().default(5)
})
  