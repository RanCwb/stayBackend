import { Module, UseGuards } from '@nestjs/common';
import { ParkingLotController } from './parking-lot.controller';
import { ParkingLotService } from './parking-lot.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  controllers: [ParkingLotController],
  providers: [ParkingLotService]
})
export class ParkingLotModule {}
