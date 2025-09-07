import { HttpStatus } from './http';

export interface Error {
    __typename: 'Error';
    message: string;
    code: HttpStatus;
    status: number;
}
