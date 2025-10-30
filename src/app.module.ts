import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OpenaiModule } from './openai/openai.module';
import { ProxyMiddleware } from './proxy/proxy.middleware';

@Module({
  imports: [AuthModule, UsersModule, OpenaiModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Proxy routes under /ui -> forward to chat.openai.com and inject cookie
    consumer.apply(ProxyMiddleware).forRoutes({ path: '/ui/*', method: 0 as any });
  }
}
