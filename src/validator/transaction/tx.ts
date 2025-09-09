import Joi from 'joi';
import { ICreateTx } from '../../types/tx';
import { TransactionType, Currency } from '../../types/enum'


export const createtx = Joi.object({
    body: Joi.object<ICreateTx>({
      quantity: Joi.number().required(),
      type: Joi.string().valid(...Object.values(TransactionType)).required(),
      currency: Joi.string().valid(...Object.values(Currency)).required(),
    }),
}).required();