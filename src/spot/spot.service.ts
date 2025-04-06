import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCarEntryDto, CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class SpotService {
  constructor(private prisma: PrismaService) {}

  async create(createSpotDto: CreateSpotDto) {
    if (!createSpotDto.number || createSpotDto.number.trim() === '') {
      throw new Error('number of the spot is required.');
    }

    const spot = await this.prisma.spot.findFirst({
      where: { number: createSpotDto.number },
    });

    if (spot) {
      throw new HttpException(
        `Spot ${createSpotDto.number} already exists.`,
        HttpStatus.CONFLICT,
      );
    }

    try {
      return await this.prisma.spot.create({
        data: {
          number: createSpotDto.number,
          parkingLotId: createSpotDto.parkingLotId,
        },
      });
    } catch (error) {
      console.error('[SpotService]', error);
      throw new Error('error creating spot.');
    }
  }

  async setCarInSpot(spotId: string, plate: string, carDto: CreateCarEntryDto) {
    try {
      const spot = await this.prisma.spot.findUnique({ where: { id: spotId } });

      if (!spot) {
        throw new HttpException('spot not found.', HttpStatus.NOT_FOUND);
      }

      if (spot.isOccupied) {
        throw new HttpException('Spot already occupied.', HttpStatus.CONFLICT);
      }

      const carEntry = await this.prisma.carEntry.create({
        data: {
          plate,
          entryTime: carDto.entryTime ?? new Date(),
          spotId,
        },
      });

      const updatedSpot = await this.prisma.spot.update({
        where: { id: spotId },
        data: {
          isOccupied: true,
        },
      });

      return {
        message: 'Car registered successfully.',
        carEntry,
        updatedSpot,
      };
    } catch (error) {
      console.error('[SpotService - setCarInSpot]', error);

      throw new HttpException(
        'Error registering car.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return `This action returns all spot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} spot`;
  }

  update(id: number, updateSpotDto: UpdateSpotDto) {
    return `This action updates a #${id} spot`;
  }

  remove(id: number) {
    return `This action removes a #${id} spot`;
  }
}
