import Joi from 'joi';
import { ICreatePosition } from '../../types/position';
import { Currency } from '../../types/enum';

export const createPosition = Joi.object({
    body: Joi.object<ICreatePosition>({
    //    portfolioId: Joi.string().required(),
       currency: Joi.string().valid(...Object.values(Currency)).required(),
    }),
}).required();


export const positionPortfolio = Joi.object({
    body: Joi.object<ICreatePosition>({
       portfolioId: Joi.string().required(),
    }),
}).required();
// export const signin = Joi.object({
//     body: Joi.object<ISignin>({
//         email: Joi.string().email().required(),
//         password: Joi.string().optional().allow(null, ''),
//     }).required(),
// });
