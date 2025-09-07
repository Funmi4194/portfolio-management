import { Keyable, Patient } from '../interface.patient';
import { IUser } from '../user/user';

declare global {
    namespace Express {
        interface Request {
            user: IUser;
            filename: string;
        }
        namespace Multer {
            interface File {
                location: string;
            }
        }
    }
}

export {};
