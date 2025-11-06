import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ReviewSectionProps {
  productId: number;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: reviews } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => apiClient.getProductReviews(productId, token || undefined),
    staleTime: 1000 * 30,
  });

  const { data: stats } = useQuery({
    queryKey: ["reviewStats", productId],
    queryFn: () => apiClient.getProductRatingStats(productId, token || undefined),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: () => apiClient.createReview(productId, rating, comment.trim() || undefined, token!),
    onSuccess: () => {
      toast.success("Đánh giá đã được gửi!");
      setRating(5);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["reviewStats", productId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể gửi đánh giá");
    },
  });

  const handleSubmit = () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }
    createMutation.mutate();
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= (interactive ? (hoveredStar || rating) : count)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Đánh giá sản phẩm</h3>

        {stats && (
          <div className="mb-6 flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-1">{renderStars(Math.round(stats.averageRating))}</div>
              <div className="text-sm text-muted-foreground mt-1">{stats.totalReviews} đánh giá</div>
            </div>
            <div className="flex-1 space-y-2">
              {stats.ratingDistribution.reverse().map((dist) => (
                <div key={dist.rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{dist.rating} ⭐</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: stats.totalReviews > 0 ? `${(dist.count / stats.totalReviews) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {token && user?.role === "Buyer" && (
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-semibold">Viết đánh giá của bạn</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đánh giá</label>
              {renderStars(rating, true)}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nhận xét (tùy chọn)</label>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSubmit} disabled={createMutation.isPending} className="gap-2">
              <Send className="h-4 w-4" />
              {createMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        )}
      </Card>

      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Đánh giá từ khách hàng</h4>
          {reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">{review.user?.email || "Người dùng"}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
