export enum TransactionType {
    BUY = "BUY",
    SELL = "SELL",
}

export enum Currency {
    USD = "USD",
    BTC = "BTC",
    ETH = "ETH",
    SOL = "SOL",
    DOGE = "DOGE",
  }
  
  export const validCurrencySymbols: Record<Currency, boolean> = {
    [Currency.USD]: true,
    [Currency.BTC]: true,
    [Currency.ETH]: true,
    [Currency.SOL]: true,
    [Currency.DOGE]: true,
  };
  
  export function isValidCurrency(symbol: string): symbol is Currency {
    return Object.values(Currency).includes(symbol as Currency);
  }
  

export enum RiskAlertType {
    STOP_LOSS = "STOP_LOSS",
    POSITION_LIMIT = "POSITION_LIMIT",
    CONCENTRATION = "CONCENTRATION",
  }