export function calcUnrealizedPnl(
  quantity: number,
  avgBuyPrice: number,
  currentPrice: number
): number {
  return (currentPrice - avgBuyPrice) * quantity;
}

