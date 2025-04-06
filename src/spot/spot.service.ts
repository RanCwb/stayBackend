import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCarEntryDto, CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { calculateDuration } from 'src/utils/calculateDuration';

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


  async removeCarFromSpot(spotId: string) {
    if (!spotId) {
      throw new HttpException('spotId is required.', HttpStatus.BAD_REQUEST);
    }

    try {
      // Fetch the spot with its related parking lot and active car entry
      const spot = await this.prisma.spot.findUnique({
        where: { id: spotId },
        include: {
          parkingLot: true,
          entries: {
            where: {
              exitTime: null, // Only get active car entry
            },
            orderBy: {
              entryTime: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!spot || !spot.entries.length) {
        throw new HttpException('No active car found in this spot.', HttpStatus.NOT_FOUND);
      }

      const activeEntry = spot.entries[0];
      const exitTime = new Date();
      const entryTime = new Date(activeEntry.entryTime);

      // Validate that entryTime is not in the future
      if (entryTime > exitTime) {
        throw new HttpException('Entry time is in the future.', HttpStatus.BAD_REQUEST);
      }

      // Calculate duration
      const diffMs = exitTime.getTime() - entryTime.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = totalMinutes / 60;

      // Calculate payment
      const pricePerHour = spot.parkingLot.pricePerHour;
      const totalAmount = parseFloat((totalHours * pricePerHour).toFixed(2));

      // Update the car entry with exitTime and totalAmount
      const updatedEntry = await this.prisma.carEntry.update({
        where: { id: activeEntry.id },
        data: {
          exitTime: exitTime,
          totalAmount: totalAmount,
        },
      });

      // Set spot as unoccupied
      const updatedSpot = await this.prisma.spot.update({
        where: { id: spotId },
        data: {
          isOccupied: false,
        },
      });

      return {
        message: 'Car successfully removed from spot.',
        duration: {
          hours: Math.floor(totalHours),
          minutes: totalMinutes % 60,
          seconds: totalSeconds % 60,
          formatted: `${Math.floor(totalHours)}h ${totalMinutes % 60}min ${totalSeconds % 60}s`,
        },
        total: `$${totalAmount.toFixed(2)}`,
        carEntry: updatedEntry,
        updatedSpot: updatedSpot,
      };
    } catch (error) {
      console.error('[SpotService - removeCarFromSpot]', error);
      throw new HttpException(
        'Error while removing car from spot.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
