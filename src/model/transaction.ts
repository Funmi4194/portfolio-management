import { TransactionType, Currency } from '../types/enum';

export interface Transaction {
  // tablename = transactions
  id: string;
  portfolio_id: string;       
  type: TransactionType;       
  symbol: Currency;             
  txhash: string;            
  quantity: number;           
  price: number;            
  fees: number;              
  created_at: Date;            
}