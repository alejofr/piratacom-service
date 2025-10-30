import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private proxy = createProxyMiddleware({
    target: 'https://chat.openai.com',
    changeOrigin: true,
    secure: true,
    ws: true,
    onProxyReq: (proxyReq, req: Request, res: Response) => {
      const cookie = process.env.CHATGPT_SESSION_COOKIE;
      if (cookie) {
        proxyReq.setHeader('Cookie', cookie);
      }
    },
  });

  use(req: Request, res: Response, next: () => void) {
    (this.proxy as any)(req, res, next);
  }
}
