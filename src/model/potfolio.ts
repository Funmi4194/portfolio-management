import { Currency } from '../types/enum';

export interface IPortfolio {
    // tablename = portfolios
    id: string; // uuid
    user_id: string;
    name: string;
    base_currency: Currency;
    total_value: number;
    created_at: Date;
}
