import { IsInt, IsOptional, IsString, IsDateString, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO để tạo chứng nhận mới
 * Có thể gắn cho batch hoặc product (ít nhất 1 trong 2)
 */
export class CreateCertificationDto {
  @ApiProperty({ description: "ID của batch (nếu chứng nhận cho batch)", required: false })
  @IsOptional()
  @IsInt()
  batchId?: number;

  @ApiProperty({ description: "ID của product (nếu chứng nhận cho product)", required: false })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({ description: "Tên chứng nhận (VD: Chứng nhận hữu cơ)" })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: "Loại chứng nhận", 
    enum: ["Organic", "Quality", "Safety", "Origin", "Other"] 
  })
  @IsString()
  type: string;

  @ApiProperty({ description: "Tổ chức cấp chứng nhận (VD: Cục An toàn Thực phẩm)" })
  @IsString()
  issuer: string;

  @ApiProperty({ description: "Ngày cấp chứng nhận (ISO format)" })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ description: "Ngày hết hạn (ISO format, không bắt buộc)", required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: "URL file chứng nhận (PDF, image)" })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: "Mô tả chi tiết về chứng nhận", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Trạng thái xác minh (mặc định false)", required: false })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
