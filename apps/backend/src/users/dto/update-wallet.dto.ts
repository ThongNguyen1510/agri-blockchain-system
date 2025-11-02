import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsNotEmpty, IsString } from "class-validator";

export class WalletUpdateNonceResponseDto {
  @ApiProperty()
  nonce!: string;
}

export class UpdateWalletDto {
  @ApiProperty({ description: "Địa chỉ ví mới muốn cập nhật" })
  @IsEthereumAddress()
  newWallet!: string;

  @ApiProperty({ description: "Chữ ký của ví cũ trên message chứa nonce" })
  @IsString()
  @IsNotEmpty()
  signature!: string;
}
