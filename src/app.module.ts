import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { ParkingLotModule } from './parking-lot/parking-lot.module';
import { SpotModule } from './spot/spot.module';
import { FinanceModule } from './finance/finance.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { TokenExpirationMiddleware } from './middlewares/token-expiration.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AdminModule,
    AuthModule,
    ParkingLotModule,
    SpotModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenExpirationMiddleware).forRoutes(
      { path: 'parking-lot', method: RequestMethod.ALL },
      { path: 'spot', method: RequestMethod.ALL },
      { path: 'finance', method: RequestMethod.ALL },
      { path: 'admin', method: RequestMethod.ALL },
    );
  }
}
