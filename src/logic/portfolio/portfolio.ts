import { portfolioRepository } from '../../repository/portfolio';
import { ICreatePortfolio } from '../../types/portfolio';
import { MakeResponse } from '../../types/generic';
import { isValidCurrency } from '../../types/enum';
import * as response from '../../garage/helper/response';
import {userRepository} from '../../repository/user';
import { randomUUID } from 'crypto';
import { Currency } from '../../types/enum';
import * as jwt from '../../garage/helper/jwt';



export async function CreatePortfolio(payload: ICreatePortfolio, userId: string): Promise<MakeResponse> {
    try {
        const portfolioRepo = await portfolioRepository();
        const userRepo = await userRepository();

        if (!payload.name || payload.name.trim() === '') {
            payload.name = "crypto-portfolio";
        }

       let user = await userRepo.findByKeyVal('id', userId);
             if (!user) {
                 return response.makeResponse(false, 'User not found.',null, 401);
             }

         // create portfolio
        const portfolio = {
            id: randomUUID(),
            user_id: user.id,
            name: payload.name,
            base_currency: Currency.USD,
            total_value: 0,
            created_at: new Date(),
        };
        

        await portfolioRepo.create({
            iMaps: [
                {
                    map: portfolio,
                    comparisonOperator: '',
                    joinOperator: '',
                },
            ],
        });
        return response.makeResponse(true, 'Portfolio created.', portfolio, 200, jwt.signToken({email: user.email}));
   }catch(error){
    console.log(error)
    return response.makeResponse(false, 'User portfolio already exists!', null);
   }
}


export async function Portfolio(payload: ICreatePortfolio,): Promise<MakeResponse> {
    try {
        const portfolioRepo = await portfolioRepository();
        const userRepo = await userRepository();

       let user = await userRepo.findByKeyVal('id', payload.userId);
             if (!user) {
                 return response.makeResponse(false, 'User not found.',null, 401);
             }

     console.log(payload.userId)
      let portfolio = await portfolioRepo.findByKeyVal('user_id', user.id);
             if (!portfolio) {
                 return response.makeResponse(false, 'User portfolio not found.', null, 401);
             }
        
        return response.makeResponse(true, 'Portfolio fetched successfully.', portfolio, 200, jwt.signToken({email: user.email}));
   }catch(error){
    console.log(error)
    return response.makeResponse(false, 'User portfolio already exists!', null);
   }
}
