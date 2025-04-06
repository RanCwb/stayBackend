import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { ParkingLotModule } from './parking-lot/parking-lot.module';
import { SpotModule } from './spot/spot.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    AdminModule,
    AuthModule,
    ParkingLotModule,
    SpotModule,
    FinanceModule
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
