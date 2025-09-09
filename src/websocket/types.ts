export interface PortfolioUpdate {
    portfolioId: string;
    value: number;
  }
  
export interface PriceUpdate {
   symbol: string;
   price: number;
   timestamp: number;
   volume24h?: number;
}
  