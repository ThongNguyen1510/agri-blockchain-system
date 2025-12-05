import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class AddProductImagesDto {
  @ApiProperty({ type: [String], description: "Danh sách URL ảnh (đã upload)", example: ["/uploads/abc.jpg"] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  urls!: string[];

  @ApiProperty({ required: false, description: "Thứ tự ảnh, cùng chiều dài với urls nếu truyền" })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  sortOrders?: number[];
}
