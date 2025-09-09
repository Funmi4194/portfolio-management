import { TransactionType, Currency } from '../types/enum';

export interface IPosition {
    // tablename = positions
    id: string;     // uuid              
    portfolio_id: string;        
    symbol: Currency;               // e.g. BTC, ETH
    quantity: number;           
    avg_buy_price: number;       
    current_price?: number;
    unrealized_pnl?: number;
    created_at: Date;   
  }
  