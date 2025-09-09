import { Currency } from '../types/enum';

export interface ICreatePosition {
    currency: Currency;
    portfolioId: string
}