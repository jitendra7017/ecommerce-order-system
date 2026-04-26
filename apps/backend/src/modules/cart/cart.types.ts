import Joi from "joi";

export const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
});
