import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateBatchDto {
  @IsString()
  @Length(3, 50)
  batchCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  farmName?: string;

  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  variety?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ipfsCid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  hashSha256?: string;
}

