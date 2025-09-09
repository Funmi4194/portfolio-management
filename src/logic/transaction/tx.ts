import { txRepository } from '../../repository/transaction';
import { positionRepository } from '../../repository/position';
import { portfolioRepository } from '../../repository/portfolio';
import { ICreateTx } from '../../types/tx';
import { MakeResponse } from '../../types/generic';
import { isValidCurrency, TransactionType, Currency } from '../../types/enum';
import * as response from '../../garage/helper/response';
import {userRepository} from '../../repository/user';
import { randomUUID } from 'crypto';
import * as jwt from '../../garage/helper/jwt';
import { Feed } from '../../websocket/server';
import * as xiao from '../../garage/xiao';



export async function CreateTx(payload: ICreateTx, userId: string): Promise<MakeResponse> {
    try {
        const txRepo = await txRepository();
        const userRepo = await userRepository();
        const positionRepo = await positionRepository();
        const portfolioRepo = await portfolioRepository();

        //  create a db tx
         const client = await txRepo.tx();

         let user = await userRepo.findByKeyVal('id',userId);
         if (!user) {
             return response.makeResponse(false, 'User not found.', null, 401);
         }

        if (!payload?.currency || !isValidCurrency(payload.currency)) {
            return response.makeResponse(false, 'Invalid currency', null, 400);
        }

        if (!payload?.type || ![TransactionType.BUY, TransactionType.SELL].includes(payload.type)) {
            return response.makeResponse(false, 'Invalid transaction type', null, 400);
        }

        if (!payload?.quantity || payload.quantity <= 0) {
            return response.makeResponse(false, 'Quantity must be > 0', null, 400);
        }

        let portfolio = await portfolioRepo.findByKeyVal('user_id',userId);
        if (!portfolio) {
            return response.makeResponse(false, 'User portfolio not found.', null, 401);
        }

        // find position
       let  position = await positionRepo.findAndLockByMap(client,{
            wMaps: [
                {
                    map: {
                        portfolio_id: portfolio.id,
                        symbol: payload.currency.toUpperCase(),
                    },
                    joinOperator: xiao.SQLOperator.And,
                    comparisonOperator: xiao.SQLOperator.Equal,
                },
            ],
            wJoinOperator: xiao.SQLOperator.And,
        });
        if (!position) {
            return response.makeResponse(false, 'symbol position not found.', null, 401);
        }
    

        // get price from redis
        const currentPrice =  Feed.getCurrentPrice(payload.currency.toUpperCase())
        console.log(currentPrice)

    
         // create portfolio
        const transaction = {
            id: randomUUID(),
            portfolio_id: portfolio.id,
            type: payload.type.toUpperCase(),
            symbol: payload.currency.toUpperCase(),
            quantity: payload.quantity,
            price: currentPrice,
            fees: 0,
            created_at: new Date(),
        };
        

        // await txRepo.create({
        //     iMaps: [
        //         {
        //             map: transaction,
        //             comparisonOperator: '',
        //             joinOperator: '',
        //         },
        //     ],
        // });

        return response.makeResponse(true, 'Transaction created.', transaction, 200, jwt.signToken({email: user.email}));
   }catch(error){
    console.log(error)
    return response.makeResponse(false, 'Error creating transaction!', null);
   }
}
