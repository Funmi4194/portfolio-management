import {userRepository} from '../../repository/user';
import { ISignin, ISignup } from '../../types/auth';
import { MakeResponse } from '../../types/generic';
import * as response from '../../garage/helper/response';
import { IUser } from '../../model/user';
import * as jwt from '../../garage/helper/jwt';
import { randomUUID } from 'crypto';
import { compareHashedPassword, generateHashedPassword } from '../../garage/helper/bcrypt';



export async function signup(payload: ISignup): Promise<MakeResponse> {
    try {
        const userRepo = await userRepository();

        if (!payload.email || payload.email.trim() === '') {
            return response.makeResponse(false, 'Email address is required!', null);
        }
          
        if (!payload.password || payload.password.trim() === '') {
            return response.makeResponse(false, 'Password is required!', null);
        }

        // check email existence
        let exists = await userRepo.exists('email', payload.email.toLowerCase());
        if (exists) {
            return response.makeResponse(false, 'Email address already in use!', null);
        }

          // create account
          const user = {
            id: randomUUID(),
            email: payload.email.toLowerCase(),
            password: generateHashedPassword(payload.password),
            created_at: new Date(),
        };

        await userRepo.create({
            iMaps: [
                {
                    map: user,
                    comparisonOperator: '',
                    joinOperator: '',
                },
            ],
        });
        return response.makeResponse(true, 'Account created.', user, 200);
   }catch(error){
    return response.makeResponse(false, 'Email address already in use!', null);
   }
}


export async function signin(payload: ISignin): Promise<MakeResponse> {
    try {
        const userRepo = await userRepository();
        // check email existence
        let user = await userRepo.findByKeyVal('email', payload.email.toLowerCase());
        if (!user) {
            return response.makeResponse(
                false,
                'Incorrect username or password! Please correct and try again.',
                [],
            );
        }

        // compare password (making this check optional cos this function is being called in-code too)
        if (payload.password) {
            if (!compareHashedPassword(payload.password, user.password)) {
                return response.makeResponse(
                    false,
                    'Incorrect username or password! Please correct and try again.',
                    [],
                );
            }
        }
        const token = jwt.signToken({email: user.email});
        return response.respondWithToken(user, 'Login successful.');
    } catch (error: any) {
        return response.makeResponse(false, 'login failed! Please try again or contact support.', {});
    }
}