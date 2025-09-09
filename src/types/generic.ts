import { IPagination } from './pagination';
import { IUser } from '../model/user';

export interface MakeResponse {
    status: boolean;
    message: string;
    data: Record<string, unknown> | null;
    code?: number;
    pagination?: IPagination;
    token?: string; 
}

export interface IContext {
    user?: IUser;
    ip?: string;
    referer?: string;
    domain?: string;
}


export interface IMail {
    from:
        | string
        | {
              name: string;
              address: string;
          };
    to: string | string[];
    subject: string;
    text?: string;
    html: string;
    attachment?: {
        filename: string;
        context: string;
    }[];
}
