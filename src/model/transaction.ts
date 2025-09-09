import { TransactionType, Currency } from '../types/enum';

export interface ITransaction {
  // tablename = transactions
  id: string;
  portfolio_id: string;       
  type: TransactionType;       
  symbol: Currency;             
  quantity: number;           
  price: number;            
  fees: number;              
  created_at: Date;            
}