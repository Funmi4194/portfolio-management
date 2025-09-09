import Joi from 'joi';
import { ISignin, ISignup } from '../../types/auth';

export const signup = Joi.object({
    body: Joi.object<ISignup>({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
}).required();

export const signin = Joi.object({
    body: Joi.object<ISignin>({
        email: Joi.string().email().required(),
        password: Joi.string().optional().allow(null, ''),
    }).required(),
});
