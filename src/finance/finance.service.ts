import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getFinanceReport(parkingLotId: string, start?: string, end?: string) {
    const startDate = start ? new Date(start + 'T00:00:00.000Z') : undefined;
    const endDate = end ? new Date(end + 'T23:59:59.999Z') : undefined;

    console.log('Query Dates:', startDate, endDate);

    const entries = await this.prisma.carEntry.findMany({
      where: {
        spot: {
          parkingLotId,
        },
        exitTime: {
          not: null,
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        spot: true,
      },
    });

    console.log('Entries found:', entries.length);

    const totalRevenue = entries.reduce(
      (acc, entry) => acc + (entry.totalAmount || 0),
      0,
    );
    const totalCars = entries.length;

    const totalTime = entries.reduce((acc, entry) => {
      if (entry.entryTime && entry.exitTime) {
        return (
          acc +
          (new Date(entry.exitTime).getTime() -
            new Date(entry.entryTime).getTime())
        );
      }
      return acc;
    }, 0);

    const avgTimeMs = totalCars > 0 ? totalTime / totalCars : 0;
    const avgHours = Math.floor(avgTimeMs / 3600000);
    const avgMinutes = Math.floor((avgTimeMs % 3600000) / 60000);

    const spotStats = new Map<
      string,
      { revenue: number; count: number; number: string }
    >();

    for (const entry of entries) {
      const spotId = entry.spotId;

      if (!spotStats.has(spotId)) {
        spotStats.set(spotId, {
          revenue: 0,
          count: 0,
          number: entry.spot.number,
        });
      }

      const stat = spotStats.get(spotId)!;
      stat.revenue += entry.totalAmount || 0;
      stat.count++;
    }

    const topSpot = [...spotStats.entries()].reduce(
      (prev, curr) => (curr[1].count > prev[1].count ? curr : prev),
      ['', { revenue: 0, count: 0, number: '' }],
    )[1];

    const spots = [...spotStats.values()].map((s) => ({
      number: s.number,
      revenue: parseFloat(s.revenue.toFixed(2)),
      count: s.count,
    }));

    return {
      parkingLotId,
      startDate,
      endDate,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalCars,
      averageTimeParked: `${avgHours}h ${avgMinutes}min`,
      topSpot,
      spots,
    };
  }
}
