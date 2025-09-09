import Joi from 'joi';
import { ICreatePortfolio } from '../../types/portfolio';

export const createPortfolio = Joi.object({
    body: Joi.object<ICreatePortfolio>({
        name: Joi.string().optional(),
    }),
}).required();

export const Portfolio = Joi.object({
    body: Joi.object<ICreatePortfolio>({
        userId: Joi.string().required(),
    }),
}).required();