export class CreateSpotDto {
  name: string;
  parkingLotId: string;
  pricePerHour: number;
  number: string;
  capacity: number;
  description: string;
  parkingLot: string;
  isOccupied: boolean;
  plate : string;
  entries: [];
}

export class CreateCarEntryDto {
  spotId: string;
  plate: string;
  entryTime: Date;
}
