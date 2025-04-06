import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ParkingLotService } from './parking-lot.service';
import { CreateParkingLotDto } from './dto/parking-lot.dto';

@Controller('parking-lot')
@UseGuards(JwtAuthGuard)
export class ParkingLotController {
  constructor(private parkingLotService: ParkingLotService) {}

  @Post()
  create(@Body() dto: CreateParkingLotDto, @Request() req) {
    const adminId = req.user?.userId;

    if (!adminId) {
      throw new Error('Token inválido: adminId não encontrado');
    }
    return this.parkingLotService.create(dto, req.user.userId);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.parkingLotService.findParkingLotsById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateParkingLotDto) {
    return this.parkingLotService.updateParkingLot(id, dto);
  }

  @Get()
  findMine(@Request() req) {
    return this.parkingLotService.findAllByAdmin(req.user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.parkingLotService.deleteParkingLot(id);
  }
}
