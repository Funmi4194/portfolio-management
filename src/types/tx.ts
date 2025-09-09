import { Currency, TransactionType } from '../types/enum';

export interface ICreateTx {
    type: TransactionType;
    currency: Currency;
    quantity: number;
}