export function calcWeightedAvgBuyPrice(
    currentAvg: number,
    currentQty: number,
    buyPrice: number,
    buyQty: number,
    fees = 0 // made fees = 0 always; left here for completeness
  ): { newQty: number; newAvg: number } {
    const costBefore = currentQty * currentAvg;
    const costNew = buyQty * buyPrice + fees;
    const newQty = currentQty + buyQty;
    const newAvg = newQty > 0 ? (costBefore + costNew) / newQty : 0;
    return { newQty, newAvg };
  }
//  only buy affect avgBuyPrice, sell doesn't