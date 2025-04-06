import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('parking-lot/:id/finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  async getFinanceReport(
    @Param('id') parkingLotId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.financeService.getFinanceReport(parkingLotId, start, end);
  }

  @Get('range')
  getRevenueBetweenDates(
    @Param('id') parkingLotId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.financeService.getFinanceReport(parkingLotId, start, end);
  }
}
