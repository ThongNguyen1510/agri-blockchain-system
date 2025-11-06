import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from "class-validator";

export class CreateBatchDto {
  @ApiPropertyOptional({ description: "Mã batch (để trống sẽ tự tạo)" })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  batchCode?: string;

  @ApiPropertyOptional({ description: "Tên sản phẩm hiển thị" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  productName?: string;

  @ApiPropertyOptional({ description: "Tên nông trại hoặc hợp tác xã" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  farmName?: string;

  @ApiPropertyOptional({ description: "Giống/Variety" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  variety?: string;

  @ApiPropertyOptional({ description: "Ngày thu hoạch" })
  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @ApiPropertyOptional({ description: "Ghi chú / mô tả sản lượng" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: "IPFS CID" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ipfsCid?: string;

  @ApiPropertyOptional({ description: "Hash truy xuất" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hashSha256?: string;

  @ApiPropertyOptional({ description: "URL tài liệu lô hàng" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  documentUrl?: string;

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

  @ApiPropertyOptional({ description: "Alias cho ghi chú (để tương thích)" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  quantityNote?: string;
}
