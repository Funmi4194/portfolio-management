import type { Server as HttpServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { PriceFeedService } from './price';

const feed = new PriceFeedService();

type Inbound =
  | { action: 'subscribe'; symbols: string[] }
  | { action: 'unsubscribe'; symbols: string[] }
  | { action: string; [k: string]: unknown }; // ignore others


export function setupWebsocketRoutes(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true, perMessageDeflate: true });

  wss.on('error', (err) => {
    console.error('[ws] server error:', (err as any)?.message || err);
  });

  httpServer.on('clientError', (err, socket) => {
    console.warn('[http] clientError:', (err as any)?.message || err);
    try { socket.destroy(); } catch {}
  });

  httpServer.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '/', `ws://${req.headers.host}`);
    const pathname = url.pathname;
    // const { pathname } = parse(req.url || '');

    if (!pathname) return socket.destroy();

    // accept connection on any /<symbol>
    wss.handleUpgrade(req, socket, head, (ws) => {
      const symbol = pathname.replace('/', '').toUpperCase();
      wss.emit('connection', ws, req, symbol);
    });
  });

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {

    ws.on('error', (err) => {
      console.warn('[ws] socket error:', (err as any)?.message || err);
    });

    // wait for client to send subscribe/unsubscribe
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as Inbound;

        if (msg.action === 'subscribe' && Array.isArray(msg.symbols)) {
          feed.subscribe(msg.symbols, ws);
          return;
        }
        if (msg.action === 'unsubscribe' && Array.isArray(msg.symbols)) {
          feed.unsubscribe(msg.symbols, ws);
          return;
        }
        // ignore other actions silently to keep protocol clean
      } catch {
        // ignore invalid JSON to keep stream consistent
      }
    });
  });
  return wss;
}
