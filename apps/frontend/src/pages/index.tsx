import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  Leaf,
  TrendingUp,
  PackageSearch,
  Wallet,
  ShoppingBag,
} from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const features = [
  {
    icon: ShieldCheck,
    title: "Minh bạch tuyệt đối",
    description: "Mọi quy trình đều được xác thực trên blockchain, không thể sửa đổi.",
  },
  {
    icon: PackageSearch,
    title: "Truy xuất tức thì",
    description: "Quét một mã QR để xem toàn bộ hành trình của lô hàng nông sản.",
  },
  {
    icon: TrendingUp,
    title: "Tối ưu giá trị",
    description: "Người sản xuất nhận đúng giá trị, người mua an tâm về chất lượng.",
  },
];

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Kết nối ví",
    description: "Liên kết MetaMask hoặc WalletConnect để sẵn sàng giao dịch.",
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "Chọn nông sản",
    description: "Duyệt marketplace và lựa chọn lô hàng từ các đối tác uy tín.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Xác minh & thanh toán",
    description: "Kiểm tra chứng từ on-chain, sau đó thanh toán qua ký quỹ an toàn.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Leaf className="h-4 w-4" />
                Blockchain cho nông nghiệp bền vững
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Nguồn gốc minh bạch,
                <span className="text-primary"> giao dịch tin cậy.</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                AgroChain kết nối nông hộ, hợp tác xã và nhà thu mua trên cùng một nền tảng. Mỗi lô hàng được chứng thực và truy xuất rõ ràng ngay lập tức.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="gap-2 bg-gradient-hero hover:opacity-90">
                    Khám phá marketplace
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/trace">
                  <Button size="lg" variant="outline" className="gap-2">
                    <PackageSearch className="h-5 w-5" />
                    Truy xuất lô hàng
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 animate-float rounded-full bg-gradient-hero opacity-20 blur-3xl" />
              <img src={heroImage} alt="AgroChain" className="relative rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center space-y-4">
            <h2 className="text-3xl font-bold md:text-4xl">Vì sao chọn AgroChain</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Tạo dựng chuỗi cung ứng minh bạch, loại bỏ giấy tờ thủ công và tăng tốc độ giao dịch nông sản.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-gradient-card p-6 transition-all hover:shadow-card-hover">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center space-y-4">
            <h2 className="text-3xl font-bold md:text-4xl">Bắt đầu chỉ với ba bước</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Từ kết nối ví đến xác minh lô hàng — mọi thao tác đều gọn nhẹ và rõ ràng cho cả người bán lẫn người mua.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-[60%] top-12 hidden h-0.5 w-full bg-border md:block" />
                )}
                <div className="relative rounded-2xl border bg-card p-8 transition-all hover:shadow-card-hover">
                  <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-hero text-lg font-bold text-white shadow-lg">
                    {step.number}
                  </div>
                  <div className="ml-8 mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-hero py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Sẵn sàng cho mùa vụ tiếp theo?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Tham gia cùng các đối tác trên AgroChain để số hóa hoàn toàn chuỗi cung ứng nông sản của bạn.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/products">
              <Button size="lg" variant="secondary" className="gap-2">
                Bắt đầu mua bán
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Liên hệ tư vấn
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
