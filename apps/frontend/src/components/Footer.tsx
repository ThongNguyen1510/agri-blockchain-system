import { Link } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">AgroChain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Nền tảng giao dịch nông sản minh bạch, bảo chứng bằng blockchain và truy xuất nguồn gốc tức thì.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Chợ nông sản
                </Link>
              </li>
              <li>
                <Link to="/trace" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Truy xuất nguồn gốc
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Doanh nghiệp</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Điều khoản
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Thông tin liên hệ</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                lienhe@agrochain.vn
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +84 123 456 789
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AgroChain. Bản quyền thuộc về AgroChain.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
