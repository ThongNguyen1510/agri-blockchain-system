import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const features = [
  "Niêm yết lô nông sản minh bạch",
  "Ký quỹ giao dịch an toàn với escrow",
  "Truy xuất nguồn gốc trên blockchain",
];

export default function Home() {
  return (
    <>
      <Head>
        <title>AgroChain Marketplace</title>
        <meta
          name="description"
          content="Nền tảng quản lý và mua bán nông sản ứng dụng blockchain"
        />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-gradient-to-br from-emerald-900 via-slate-950 to-emerald-950 px-6 py-16 text-white">
        <section className="max-w-3xl space-y-6 text-center">
          <span className="rounded-full border border-lime-300/40 bg-lime-300/10 px-4 py-1 text-sm font-semibold uppercase tracking-wider text-lime-200">
            AgroChain Demo
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">
            AgroChain Marketplace
          </h1>
          <p className="text-lg text-emerald-100/80">
            Kết nối ví blockchain của bạn để quản lý sản phẩm, đặt hàng và theo
            dõi giao dịch escrow nông sản.
          </p>
          <ul className="mx-auto flex max-w-2xl flex-col gap-3 text-left sm:flex-row sm:flex-wrap sm:justify-center">
            {features.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-white/5 px-4 py-3 backdrop-blur"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-lime-400/20 text-lime-200">
                  ✓
                </span>
                <span className="text-emerald-100/80">{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
      </main>
    </>
  );
}
