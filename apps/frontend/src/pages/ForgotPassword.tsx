import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.forgotPassword(email);
      toast.success(response.message);
      setEmailSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Button>
          </Link>

          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Quên mật khẩu?</h1>
              <p className="text-muted-foreground">
                Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
              </p>
            </div>

            {emailSent ? (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Email đã được gửi!</p>
                  <p className="text-sm">
                    Vui lòng kiểm tra email của bạn để nhận link đặt lại mật khẩu.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Link sẽ hết hạn sau 15 phút.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Lưu ý:</strong> Trong môi trường development, token sẽ được hiển thị trong console log của backend.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-hero hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi yêu cầu"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Đã nhớ mật khẩu?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
