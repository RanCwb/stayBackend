import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { SpotService } from './spot.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('spot')
@UseGuards(JwtAuthGuard)
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

  @Post('create')
  create(@Body() createSpotDto: CreateSpotDto) {
    return this.spotService.create(createSpotDto);
  }

  @Post('setCarInSpot')
  async createEntry(
    @Body() body: { spotId: string; plate: string; entryTime: Date },
  ) {
    const { spotId, plate, entryTime } = body;

    if (!spotId || !plate || !entryTime) {
      throw new BadRequestException('spotId, plate and entryTime are required');
    }

    return this.spotService.setCarInSpot(spotId, plate, {
      spotId,
      plate,
      entryTime,
    });
  }

  @Get()
  findAll() {
    return this.spotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spotService.findOne(+id);
  }


  @Patch(':id')
  removeCarFromSpot(@Param('id') id: string) {
    return this.spotService.removeCarFromSpot(id);
  }
}
