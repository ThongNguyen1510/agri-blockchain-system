import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewDto } from "./dto/review.dto";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(
    productId: number,
    userId: number,
    dto: CreateReviewDto
  ): Promise<ReviewDto> {
    // Kiểm tra product tồn tại
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Kiểm tra user đã mua sản phẩm này chưa
    const hasPurchased = await this.prisma.order.findFirst({
      where: {
        productId,
        buyerId: userId,
      },
    });

    if (!hasPurchased) {
      throw new BadRequestException("You must purchase this product before reviewing");
    }

    // Kiểm tra đã review chưa
    const existingReview = await this.prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this product");
    }

    // Tạo review
    const review = await this.prisma.review.create({
      data: {
        productId,
        userId,
        rating: dto.rating,
        comment: dto.comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return ReviewDto.fromEntity(review);
  }

  async getProductReviews(productId: number): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map(ReviewDto.fromEntity);
  }

  async getUserReviews(userId: number): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map(ReviewDto.fromEntity);
  }

  async deleteReview(reviewId: number, userId: number): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async getProductRatingStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [1, 2, 3, 4, 5].map(r => ({ rating: r, count: 0 })),
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = sum / totalReviews;

    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
    }));

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution: distribution,
    };
  }
}
