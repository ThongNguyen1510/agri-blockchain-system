import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Leaf, ShoppingCart, Search, User, Store } from "lucide-react";

const LABEL_PRODUCTS = "Chợ nông sản";
const LABEL_ORDERS = "Đơn hàng";
const LABEL_TRACE = "Truy xuất";
const LABEL_SELLER_DASHBOARD = "Bán hàng";
const LABEL_CONNECTING = "Đang kết nối...";
const LABEL_CONNECT_WALLET = "Kết nối ví";
const LABEL_SIGN_OUT = "Đăng xuất";
const LABEL_SIGN_IN = "Đăng nhập";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const { walletAddress, connect, disconnect, isConnecting } = useWallet();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleAuthAction = () => {
    if (token) {
      logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  const handleWalletClick = () => {
    if (walletAddress) {
      disconnect();
    } else {
      void connect();
    }
  };

  const shortAddress =
    walletAddress && walletAddress.length > 8
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;

  const walletLabel = isConnecting ? LABEL_CONNECTING : shortAddress ?? LABEL_CONNECT_WALLET;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-primary">AgroChain</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/products") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {LABEL_PRODUCTS}
            </Link>
            <Link
              to="/orders"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/orders") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {LABEL_ORDERS}
            </Link>
            <Link
              to="/trace"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/trace") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {LABEL_TRACE}
            </Link>
            {token && user?.role === "Seller" && (
              <Link
                to="/seller/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/seller") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  {LABEL_SELLER_DASHBOARD}
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden lg:inline-flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => navigate("/orders")}
              title="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {token && user && (
              <Link to="/profile" className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm text-muted-foreground md:flex hover:bg-muted/50 transition-colors">
                <User className="h-4 w-4 text-primary" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </Link>
            )}
            <Button variant="outline" onClick={handleWalletClick} disabled={isConnecting}>
              {walletLabel}
            </Button>
            <Button className="bg-gradient-hero hover:opacity-90" onClick={handleAuthAction}>
              {token ? LABEL_SIGN_OUT : LABEL_SIGN_IN}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
