import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, type Location } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { UserRole } from "@/types/api";

interface LocationState {
  from?: Location;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, token } = useAuth();
  const { walletAddress } = useWallet();
  const from = (location.state as LocationState)?.from?.pathname ?? "/";

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("Buyer");
  const [regWalletAddress, setRegWalletAddress] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
  }, [token, from, navigate]);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (walletAddress) {
      setRegWalletAddress(walletAddress);
    }
  }, [walletAddress]);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success("Đăng nhập thành công");
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validation
    if (regPassword !== regConfirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    
    if (regPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!regWalletAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ ví hoặc kết nối ví blockchain");
      return;
    }

    setIsRegistering(true);
    try {
      await register(regEmail.trim(), regPassword, regRole, regWalletAddress.trim());
      toast.success("Đăng ký thành công");
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng ký thất bại";
      toast.error(message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <Card className="p-8 shadow-xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-primary">AgroChain</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Hệ thống quản lý mua bán nông sản blockchain
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ban@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                      Mật khẩu
                    </label>
                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90" disabled={isSubmitting}>
                    {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                {!walletAddress && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">💡 Mẹo:</p>
                    <p>Kết nối ví blockchain trước khi đăng ký để tự động điền địa chỉ ví vào form này.</p>
                  </div>
                )}
                <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="reg-email" className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ban@example.com"
                      value={regEmail}
                      onChange={(event) => setRegEmail(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="text-sm font-medium text-muted-foreground">
                      Mật khẩu
                    </label>
                    <Input
                      id="reg-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                      value={regPassword}
                      onChange={(event) => setRegPassword(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reg-confirm-password" className="text-sm font-medium text-muted-foreground">
                      Xác nhận mật khẩu
                    </label>
                    <Input
                      id="reg-confirm-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                      value={regConfirmPassword}
                      onChange={(event) => setRegConfirmPassword(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reg-role" className="text-sm font-medium text-muted-foreground">
                      Vai trò
                    </label>
                    <Select value={regRole} onValueChange={(value: UserRole) => setRegRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buyer">Người mua (Buyer)</SelectItem>
                        <SelectItem value="Seller">Người bán (Seller)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reg-wallet" className="text-sm font-medium text-muted-foreground">
                      Địa chỉ ví blockchain
                    </label>
                    <Input
                      id="reg-wallet"
                      type="text"
                      required
                      placeholder="0x..."
                      value={regWalletAddress}
                      onChange={(event) => setRegWalletAddress(event.target.value)}
                      readOnly={!!walletAddress}
                      className={walletAddress ? "bg-muted" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      {walletAddress 
                        ? "Địa chỉ ví đã được tự động điền từ ví kết nối" 
                        : "Địa chỉ ví Ethereum để thực hiện giao dịch"
                      }
                    </p>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90" disabled={isRegistering}>
                    {isRegistering ? "Đang xử lý..." : "Đăng ký"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Cần hỗ trợ?{" "}
              <Link to="/" className="text-primary hover:underline">
                Liên hệ quản trị viên
              </Link>
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
