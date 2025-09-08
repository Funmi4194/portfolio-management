import { WebSocket } from 'ws';

export function startPriceFeed(ws: WebSocket, symbol: string) {
  console.log(`📡 client connected to ${symbol}`);

  const interval = setInterval(() => {
    const price = (Math.random() * 1000 + 100).toFixed(2); // mock price
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ symbol, price, ts: Date.now() }));
    }
  }, 1000); // every 1s

  ws.on('close', () => {
    clearInterval(interval);
    console.log(`❌ client left ${symbol}`);
  });
}
