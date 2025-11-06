import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user-role.enum";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewDto } from "./dto/review.dto";

@ApiTags("reviews")
@ApiBearerAuth()
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(UserRole.Buyer)
  @Post("products/:productId/reviews")
  async createReview(
    @Param("productId", ParseIntPipe) productId: number,
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewsService.createReview(productId, user.id, dto);
  }

  @Get("products/:productId/reviews")
  async getProductReviews(
    @Param("productId", ParseIntPipe) productId: number,
  ): Promise<ReviewDto[]> {
    return this.reviewsService.getProductReviews(productId);
  }

  @Get("products/:productId/reviews/stats")
  async getProductRatingStats(
    @Param("productId", ParseIntPipe) productId: number,
  ): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    return this.reviewsService.getProductRatingStats(productId);
  }

  @Get("reviews/me")
  async getMyReviews(@CurrentUser() user: CurrentUserType): Promise<ReviewDto[]> {
    return this.reviewsService.getUserReviews(user.id);
  }

  @Delete("reviews/:id")
  async deleteReview(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ message: string }> {
    await this.reviewsService.deleteReview(id, user.id);
    return { message: "Review deleted successfully" };
  }
}
