import { ApiProperty } from "@nestjs/swagger";

export class BatchListItemDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  batchCode!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  quantityNote!: string | null;

  @ApiProperty()
  harvestDate!: string | null;

  @ApiProperty()
  ipfsCid!: string | null;

  @ApiProperty()
  hashSha256!: string | null;

  @ApiProperty()
  createdAt!: string;
}
