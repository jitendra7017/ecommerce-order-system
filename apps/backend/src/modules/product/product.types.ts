import Joi from "joi";

export const upsertProductSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  categoryId: Joi.number().integer().positive().required(),
});
