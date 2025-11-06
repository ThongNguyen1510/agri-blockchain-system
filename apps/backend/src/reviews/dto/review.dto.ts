import { Review } from "@prisma/client";

export class ReviewDto {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: {
    id: number;
    email: string;
  };

  static fromEntity(review: Review & { user?: { id: number; email: string } }): ReviewDto {
    const dto = new ReviewDto();
    dto.id = review.id;
    dto.productId = review.productId;
    dto.userId = review.userId;
    dto.rating = review.rating;
    dto.comment = review.comment;
    dto.createdAt = review.createdAt.toISOString();
    if (review.user) {
      dto.user = {
        id: review.user.id,
        email: review.user.email,
      };
    }
    return dto;
  }
}
