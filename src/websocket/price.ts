import { WebSocket } from 'ws';
import type { PriceUpdate } from './types';
import { cacheGet, cacheSet } from '../database/redis';

const INTERVAL_MS  = Number(process.env.PRICE_FEED_INTERVAL_MS) || 20_000; // 20s
const TTL_SECONDS  = Number(process.env.PRICE_FEED_TTL_SECONDS) || 30;      
  
export class PriceFeedService {
  private prices = new Map<string, number>(); // holds the last generated price for each symbol (local memory)
  private timers = new Map<string, NodeJS.Timeout>(); // stores setInterval handles so each symbol runs on its own timer
  private listeners = new Map<string, Set<WebSocket>>(); // tracks which WebSocket clients are subscribed to which symbol.

  subscribe(symbols: string[], ws?: WebSocket) {
    const unique = [...new Set(symbols.map((s) => s.toUpperCase()))]; // normalize the symbols
    for (const sym of unique) {
      if (ws) {
        if (!this.listeners.has(sym)) this.listeners.set(sym, new Set());
        this.listeners.get(sym)!.add(ws);
        ws.once('close', () => this.listeners.get(sym)?.delete(ws));
      }
      this.startMock(sym);
    }
  }

  unsubscribe(symbols: string[] | string, ws?: WebSocket) {
    const list = (Array.isArray(symbols) ? symbols : [symbols]).map((s) => s.toUpperCase());
    for (const sym of list) {
      if (ws) this.listeners.get(sym)?.delete(ws);
      const remaining = this.listeners.get(sym)?.size ?? 0;
      if (remaining === 0) this.stopMock(sym);
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const sym = symbol.toUpperCase();
    const key = this.key(sym);

    try {
      const cached = await cacheGet(key); // get cache 
      if (cached) return Number(cached);
    } catch {}

    const price = this.prices.get(sym) ?? this.seed(sym); // try in memory map of last known price else generate a seed price 
    (async () => { try { await cacheSet(key, String(price), TTL_SECONDS); } catch {} })();
    return price;
  }

  private generatePrice(symbol: string): PriceUpdate {
    const prev = this.prices.get(symbol)!;
    const jitter = 1 + (Math.random() - 0.5) * 0.001; // ±0.05%
    const next = +(prev * jitter).toFixed(4);

    this.prices.set(symbol, next);

    (async () => {
      try {
        await cacheSet(this.key(symbol), String(next), TTL_SECONDS);
      } catch {}
    })();

    return {
      symbol,
      price: next,
      timestamp: Date.now(),
      volume24h: +(Math.random() * 10_000_000).toFixed(2),
    };
  }


  private startMock(symbol: string) {
    const sym = symbol.toUpperCase();
    if (this.timers.has(sym)) return;

    if (!this.prices.has(sym)) this.seed(sym);

    const t = setInterval(() => {
        const update = this.generatePrice(sym);
        this.publish(update);
    }, INTERVAL_MS);

    this.timers.set(sym, t);
  }

  private stopMock(symbol: string) {
    const t = this.timers.get(symbol);
    if (t) clearInterval(t);
    this.timers.delete(symbol);
  }

  private publish(update: PriceUpdate) {
    const set = this.listeners.get(update.symbol);
    if (!set || set.size === 0) return;
    const json = JSON.stringify(update);
    for (const ws of set) {
      if (ws.readyState === ws.OPEN) ws.send(json);
    }
  }

  private seed(symbol: string): number {
    const bases: Record<string, number> = { BTC: 65000, ETH: 3500, SOL: 240, DOGE: 0.12 };
    const base = bases[symbol.toUpperCase()] ?? 100 + Math.random() * 1000;
    this.prices.set(symbol.toUpperCase(), base);
    return base;
  }

  private key(symbol: string) {
    return `price:${symbol}`;
  }
}
