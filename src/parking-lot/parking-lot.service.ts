import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParkingLotDto } from './dto/parking-lot.dto';

@Injectable()
export class ParkingLotService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateParkingLotDto, adminId: string) {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('name is required.');
    }

    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    const nameExists = await this.prisma.parkingLot.findFirst({
      where: { name: dto.name },
    });

    if (!admin || nameExists) {
      throw new NotFoundException('Error creating parking lot, admin not found or name already exists.');
    }

    try {
      return await this.prisma.parkingLot.create({
        data: {
          name: dto.name,
          address: dto.address,
          pricePerHour: dto.pricePerHour,
          adminId,
        },
      });
    } catch (error) {
      console.error('[ParkingLotService]', error);
      throw new InternalServerErrorException('error creating parking lot.');
    }
  }

  async deleteParkingLot(id: string) {
    if (!id) {
      throw new BadRequestException('O ID é obrigatório.');
    }

    try {
      const parking = await this.prisma.parkingLot.findUnique({ where: { id } });
  
      if (!parking ) {
        throw new NotFoundException('Parking lot not found.');
      }
  
      await this.prisma.parkingLot.delete({ where: { id } });
  
      return {
        message: 'Parking lot deleted successfully.',
        deletedParkingLot: parking,
      };
    } catch (error) {
      console.error('[ParkingLotService - delete]', error);
      throw new InternalServerErrorException('Error deleting parking lot.');
    }
  }

  async findParkingLotsById(id: string) {
    try {
      const parking = await this.prisma.parkingLot.findUnique({
        where: { id },
      });

      if (!parking) {
        throw new NotFoundException('error finding parking lot.');
      }

      const { id: parkingId, name, address, pricePerHour, adminId } = parking;

      return {
        id: parkingId,
        name,
        address,
        pricePerHour,
        adminId,
      };
    } catch (error) {
      console.error('[ParkingLotService]', error);
      throw new InternalServerErrorException('error finding parking lot.');
    }
  }

  async updateParkingLot(id: string, dto: CreateParkingLotDto) {
  
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('name is required.');
    }
    
    try {
      return await this.prisma.parkingLot.update({
        where: { id },
        data: {
          name: dto.name,
          address: dto.address,
          pricePerHour: dto.pricePerHour,
        },
      });
    } catch (error) {
      console.error('[ParkingLotService]', error);
      throw new InternalServerErrorException('error updating parking lot.');
    }
  }

  async findAllByAdmin(adminId: string) {
    return this.prisma.parkingLot.findMany({
      where: { adminId },
    });
  }
}
