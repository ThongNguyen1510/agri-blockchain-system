import { IsString, MaxLength } from "class-validator";

export class TransferOwnershipDto {
  @IsString()
  toRole!: string; // 'Distributor' | 'Shop' | 'Customer'

  @IsString()
  @MaxLength(100)
  toName!: string;
}
