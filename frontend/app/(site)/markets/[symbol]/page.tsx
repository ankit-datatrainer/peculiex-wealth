import type { Metadata } from "next";
import StockDetail from "@/components/StockDetail";

type Props = {
  params: { symbol: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sym = decodeURIComponent(params.symbol).toUpperCase();
  return {
    title: `${sym} — Live Price, Chart & Stats`,
    description: `Live ${sym} price, intraday chart, key statistics, financials and news on Peculiex.`
  };
}

export default function StockSymbolPage({ params }: Props) {
  const sym = decodeURIComponent(params.symbol);
  return <StockDetail symbol={sym} />;
}
