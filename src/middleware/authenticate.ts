import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as jwt from '../garage/helper/jwt';
import {userRepository} from '../repository/user';
import * as response from '../garage/helper/response';
import { IContext, MakeResponse } from '../types/generic';
import { Error } from '../types/error';
import { IUser } from '../model/user';

export default async (req: Request): Promise<IContext | Error> => {
    const ip = req.ip; 

    const referer = (req.headers['x-portfolio-dev'] as string) || req.headers.referer || '';

    const domain = req.protocol + '://' + req.get('host');

    if (
        req.body.query?.includes('IntrospectionQuery') ||
        !req ||
        !req.headers ||
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer ') ||
        !req.headers.authorization.split(' ')[1] ||
        !req.headers.authorization.split(' ')[1].length
    ) {
        return { ip, referer, domain };
    }

    const auth = req.headers.authorization;
   // no header or wrong scheme → unauthenticated context
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
       return { ip, referer, domain };
    }
    const token = auth!.split(' ')[1];
    if (token) {
        const verified = await jwt.verifyToken(token);
        if (verified.status) {
            const userRepo = await userRepository();
            const userId = (verified.data as { id: string }).id;
            const user = await userRepo.findByKeyVal('id', userId);
            if (!user) {
                return response.sendErrorResponse('Login required!', 401);
            }
            return { user, ip, referer, domain };
        }
        return response.sendErrorResponse(verified.message, verified.code);
    }
    return { ip, referer, domain };
};

export const validateAccess = (
    user: IUser,
    requirements: { key: string; value: any; error: string }[],
    or = false,
): MakeResponse => {
    if (!user) {
        return {
            status: false,
            message: 'Login required!',
            data: {},
            code: 401,
        };
    }

    // verify that user meets the required requirements
    // requirements uses AND operation
    if (requirements.length) {
        for (const requirement of requirements) {
            // re-assigning user with type any for this to work
            const u: any = user;
            if (u[requirement.key] != requirement.value) {
                return {
                    status: false,
                    message: requirement.error,
                    data: {},
                    code: 403,
                };
            }
        }
    }

    return {
        status: true,
        message: 'Access granted!',
        data: {},
    };
};


/**
 * when passing 'pin' as a part of the headers
 * @param headers
 * @param tabs
 * @param roles
 * @returns
 */
export const authenticate = (
    headers = ['authorization'],
    requirements: { key: string; value: unknown; error: string }[] = [],
): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        for (const header of headers) {
            const value = req.headers[header];
            if (header === 'authorization') {
                if (!value) {
                    return response._sendErrorResponse(res, 'Please login again!', {}, 401);
                }
                const verified = await jwt.verifyToken((value as string).split(' ')[1]);
                if (!verified.status) {
                    return response._sendErrorResponse(res, verified.message, {}, 401);
                }

                const userRepo = await userRepository();
                const userId = (verified.data as { id: string }).id;
                const user = await userRepo.findByKeyVal('id', userId);
                if (!user) {
                    return response._sendErrorResponse(res, 'Please login again!', {}, 401);
                }
            }
        }
        for (const requirement of requirements) {
            if (req.user && req.user[requirement.key as keyof IUser] !== requirement.value) {
                return response._sendErrorResponse(res, requirement.error, {}, 403);
            }
        }
        return next();
    };
};
