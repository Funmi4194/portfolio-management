import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms'; 
import { makeResponse } from './response';
import { MakeResponse } from '../../types/generic';
import env from '../../config/env';

/**
 * Signs a token with the given payload
 * @param payload  Payload to be signed
 * @returns Signed token
 */
export const signToken = (payload: Record<string, unknown>, expiry?: StringValue | number): string => {
    const options: SignOptions = {
        expiresIn: expiry ?? env.jwt.expiry as SignOptions['expiresIn'],
        issuer: env.name,
        algorithm: 'HS256', // optional but explicit
      };   
    return jwt.sign(payload, env.jwt.secret, options);
};


/**
 * Verifies a token
 * @param token  Token to be verified
 * @returns Verification status and data
 * @throws Error
 */ 

export const verifyToken = async (token: string): Promise<MakeResponse> => {
    if (!token) {
        return makeResponse(false, 'Login required! Auth token missing.', {}, 401);
    }
    try {
        return makeResponse(
            true,
            '',
            jwt.verify(token, env.jwt.secret, {
                issuer: env.name,
            }) as JwtPayload,
        );
    } catch (error) {
        return makeResponse(false, 'Login required! Invalid auth token.', {}, 401);
    }
};
