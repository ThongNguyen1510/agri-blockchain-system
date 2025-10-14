import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateBatchDto {
  @ApiProperty({ description: "Tên sản phẩm chính" })
  @IsString()
  productName!: string;

  @ApiProperty({ description: "Mã batch tùy chọn", required: false })
  @IsOptional()
  @IsString()
  batchCode?: string;

  @ApiPropertyOptional({ description: "Tên nông trại hoặc hợp tác xã" })
  @IsOptional()
  @IsString()
  farmName?: string;

  @ApiPropertyOptional({ description: "Giống/variety" })
  @IsOptional()
  @IsString()
  variety?: string;

  @ApiPropertyOptional({ description: "Ngày thu hoạch" })
  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @ApiPropertyOptional({ description: "Ghi chú / mô tả số lượng" })
  @IsOptional()
  @IsString()
  quantityNote?: string;

  @ApiPropertyOptional({ description: "IPFS CID" })
  @IsOptional()
  @IsString()
  ipfsCid?: string;

  @ApiPropertyOptional({ description: "Hash truy xuất" })
  @IsOptional()
  @IsString()
  hashSha256?: string;

  @ApiPropertyOptional({ description: "Giá bán mỗi đơn vị (ETH)" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEth?: number;

  @ApiPropertyOptional({ description: "Tồn kho ban đầu" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
