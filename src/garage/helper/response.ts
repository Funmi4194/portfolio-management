import { MakeResponse } from '../../types/generic';
import { ValidationError } from 'joi';
import { HttpStatus, StatusForCode } from '../../types/http';
import { logger } from '../log/logger';
import { Error } from '../../types/error';
import { Response } from 'express';
import * as jwt from '../helper/jwt';

export const makeResponse = (
    status: boolean,
    message: string,
    data: any,
    code: number = 400,
    token?: string,
): MakeResponse => {
    return {
        status,
        message,
        data,
        code,
        token
    };
};

export const _sendErrorResponse = (
    res: Response,
    message: string,
    data: Record<string, any>,
    statusCode: number = 400,
): Response => {
    return res.status(statusCode).json({
        status: false,
        message: message,
        data: data,
    });
};

export const _sendSuccessResponse = (
    res: Response,
    message: string,
    data: Record<string, any>,
    statusCode: number = 200,
    token?: string,
): Response | void => {
    return res.status(statusCode).json({
        status: true,
        message: message,
        data: data,
        token: token
    });
};

export const sendErrorResponse = (message: string, code: number = 400): Error => {
    logger.error(`[${new Date().toUTCString()}] :: error with message and code :: ${message} :: ${code}`);
    return {
        __typename: 'Error',
        message,
        code: StatusForCode[code] || HttpStatus.BadRequest,
        status: code,
    };
};

export const sendSuccessResponse = (
    typename: string,
    message: string,
    data: unknown,
): {
    __typename: string;
    message: string;
    data: unknown;
} => {
    return {
        __typename: typename,
        message,
        data,
    };
};

export const handleValidationError = (validateErrorData: ValidationError): Error => {
    return sendErrorResponse(validateErrorData.details[0].message, 400);
};

export const respondWithToken = <T extends { id?: string; email?: string }>(
    user: T,
    message: string,
    data: any = null,
    code = 200
  ): MakeResponse => {
    const token = jwt.signToken({ id: user.id, email: user.email });
    return {
      status: true,
      message,
      data: data ?? user, // return user as default data
      code,
      token,
    };
  };
  