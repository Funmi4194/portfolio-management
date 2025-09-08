import type { Server as HttpServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { startPriceFeed } from './mock';

export function setupWebsocketRoutes(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url || '');

    if (!pathname) return socket.destroy();

    // accept connection on any /<symbol>
    wss.handleUpgrade(req, socket, head, (ws) => {
      const symbol = pathname.replace('/', '').toUpperCase();
      wss.emit('connection', ws, req, symbol);
    });
  });

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage, symbol: string) => {
    startPriceFeed(ws, symbol);
  });

  return wss;
}
