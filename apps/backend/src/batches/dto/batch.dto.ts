import { ApiProperty } from "@nestjs/swagger";
import { Batch } from "@prisma/client";

export class BatchDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  batchCode!: string;

  @ApiProperty({ required: false, nullable: true })
  farmName?: string | null;

  @ApiProperty({ required: false, nullable: true })
  harvestDate?: string | null;

  @ApiProperty({ required: false, nullable: true })
  variety?: string | null;

  @ApiProperty({ required: false, nullable: true })
  notes?: string | null;

  @ApiProperty({ required: false, nullable: true })
  ipfsCid?: string | null;

  @ApiProperty({ required: false, nullable: true })
  hashSha256?: string | null;

  @ApiProperty()
  createdBy!: number;

  @ApiProperty()
  createdAt!: Date;

  static fromEntity(batch: Batch): BatchDto {
    const dto = new BatchDto();
    dto.id = batch.id;
    dto.batchCode = batch.batchCode;
    dto.farmName = batch.farmName;
    dto.harvestDate = batch.harvestDate
      ? batch.harvestDate.toISOString()
      : null;
    dto.variety = batch.variety;
    dto.notes = batch.notes;
    dto.ipfsCid = batch.ipfsCid;
    dto.hashSha256 = batch.hashSha256;
    dto.createdBy = batch.createdBy;
    dto.createdAt = batch.createdAt;
    return dto;
  }
}

