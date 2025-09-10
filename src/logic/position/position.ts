import { positionRepository } from '../../repository/position';
import { ICreatePosition } from '../../types/position';
import { MakeResponse } from '../../types/generic';
import { isValidCurrency, TransactionType, Currency } from '../../types/enum';
import * as response from '../../garage/helper/response';
import {userRepository} from '../../repository/user';
import { portfolioRepository } from '../../repository/portfolio';
import { randomUUID } from 'crypto';
import * as jwt from '../../garage/helper/jwt';
import { Feed } from '../../websocket/server';
import * as xiao from '../../garage/xiao';
import { txRepository } from '../../repository/transaction';
import { ICreateTx } from '../../types/tx';
import { calcWeightedAvgBuyPrice } from './average_buy_price';
import { calcUnrealizedPnl } from './unrealized_pnl';





export async function CreatePosition(payload: ICreatePosition, userId: string): Promise<MakeResponse> {
   
    try {
        const positionRepo = await positionRepository();
        const userRepo = await userRepository();
        const portfolioRepo = await portfolioRepository();
 
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


        const currentPrice = await Feed.getCurrentPrice(payload.currency.toUpperCase()) 
        
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
        return response.makeResponse(true, 'Position created.', position, 200, jwt.signToken({email: user.email}));
   }catch(error){
    console.log(error)
    return response.makeResponse(false, 'User position already exists!', null);
   }
}



export async function UpdatePosition(payload: ICreateTx, userId: string): Promise<MakeResponse> {

    const txRepo = await txRepository();
    const userRepo = await userRepository();
    const positionRepo = await positionRepository();
    const portfolioRepo = await portfolioRepository();
    // db tx
    const client = await txRepo.tx();
    try {
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
        const currentPrice = await Feed.getCurrentPrice(payload.currency.toUpperCase())
        console.log(currentPrice)

        if (payload.type === TransactionType.BUY) {

            position.current_price = currentPrice
            // calculate avgBuyPrice
            const { newQty, newAvg } = calcWeightedAvgBuyPrice(
            position.avg_buy_price,
            position.quantity,
            currentPrice,  // buy price
            payload.quantity     // buy qty
          );
         
          const unrealizedPnl = calcUnrealizedPnl(
            newQty,
            position.avg_buy_price,
            currentPrice,  // buy price
          );

          position.quantity = newQty
          position.avg_buy_price = newAvg
          position.unrealized_pnl = unrealizedPnl

          // portfolio balc should be reduced
        }else {

            if (payload.quantity > position.quantity){
                return response.makeResponse(false, 'Sell order cannot be fulfilled due to insufficient qty in position!', null);
            }

            const unrealizedPnl = calcUnrealizedPnl(
                position.quantity - payload.quantity,
                position.avg_buy_price,
                currentPrice,  // buy price
              );
        }
     


    
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
        

        await txRepo.createTx(client,{
            iMaps: [
                {
                    map: transaction,
                    comparisonOperator: '',
                    joinOperator: '',
                },
            ],
        });


        client.commit

        return response.makeResponse(true, 'Transaction created.', transaction, 200, jwt.signToken({email: user.email}));
   }catch(error){
    console.log(error)
    await client.rollback();
    return response.makeResponse(false, 'Error creating transaction!', null);
   }
}
