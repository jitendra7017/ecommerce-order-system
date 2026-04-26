import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).required(),
});
