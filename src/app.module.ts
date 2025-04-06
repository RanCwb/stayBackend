import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { ParkingLotModule } from './parking-lot/parking-lot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ← ESSENCIAL
    PrismaModule,
    AdminModule,
    AuthModule,
    ParkingLotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
