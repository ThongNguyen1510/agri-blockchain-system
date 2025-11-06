import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty({ description: "Rating from 1 to 5", minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: "Review comment", required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
