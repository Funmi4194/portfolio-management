import { positionRepository } from '../../repository/position';
import { ICreatePosition } from '../../types/position';
import { MakeResponse } from '../../types/generic';
import { isValidCurrency } from '../../types/enum';
import * as response from '../../garage/helper/response';
import {userRepository} from '../../repository/user';
import { portfolioRepository } from '../../repository/portfolio';
import { randomUUID } from 'crypto';
import { Currency } from '../../types/enum';
import * as jwt from '../../garage/helper/jwt';
import { Feed } from '../../websocket/server';



export async function CreatePosition(payload: ICreatePosition, userId: string): Promise<MakeResponse> {
    console.log("heyyyyy")
    console.log(isValidCurrency(payload.currency))
    try {
        const positionRepo = await positionRepository();
        const userRepo = await userRepository();
        const portfolioRepo = await portfolioRepository();
        console.log("heyyyyy")
        console.log(isValidCurrency(payload.currency))
 

        if (!payload?.currency || !isValidCurrency(payload.currency)) {
            return response.makeResponse(false, 'Invalid currency', null, 400);
        }

        let user = await userRepo.findByKeyVal('id', userId);
        if (!user) {
            return response.makeResponse(false, 'Portfolio not found.', null, 401);
    } 

        let portfolio = await portfolioRepo.findByKeyVal('id', payload.portfolioId);
            if (!portfolio) {
                return response.makeResponse(false, 'Portfolio not found.', null, 401);
        } 

         if (portfolio.user_id !== userId){
            return response.makeResponse(false, 'Invalid portfolio', null, 401);
        }


        const currentPrice =  Feed.getCurrentPrice(payload.currency.toUpperCase()) 

        console.log(currentPrice)
        
        // create portfolio
        const position = {
            id: randomUUID(),
            portfolio_id: portfolio.id,
            symbol: payload.currency.toUpperCase(),
            quantity: 0,
            avg_buy_price: 0,
            current_price: currentPrice,
            unrealized_pnl: 0,
            created_at: new Date(),
        };
        

        await positionRepo.create({
            iMaps: [
                {
                    map: position,
                    comparisonOperator: '',
                    joinOperator: '',
                },
            ],
        });
        return response.makeResponse(true, 'Position created.', portfolio, 200, jwt.signToken({email: user.email}));
   }catch(error){
    console.log(error)
    return response.makeResponse(false, 'User position already exists!', null);
   }
}
