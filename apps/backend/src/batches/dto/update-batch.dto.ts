import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateBatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  farmName?: string;

  @IsOptional()
  @IsString()
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
  ipfsCid?: string;

  @IsOptional()
  @IsString()
  hashSha256?: string;
}
