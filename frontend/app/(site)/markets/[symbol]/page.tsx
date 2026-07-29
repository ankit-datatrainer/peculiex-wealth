import type { Metadata } from "next";
import StockDetail from "@/components/StockDetail";
import { displaySymbol, exchangeOf, toApiSymbol } from "@/lib/symbol";

type Props = {
  params: { symbol: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // The URL carries "BHARTIARTL-NSE"; the tab should read "BHARTIARTL (NSE)"
  // rather than leaking Yahoo's ".NS" lookup suffix to the reader.
  const api = toApiSymbol(params.symbol);
  const ticker = displaySymbol(api).toUpperCase();
  const exchange = exchangeOf(api);
  return {
    title: `${ticker} (${exchange}): Live Price, Chart & Stats`,
    description: `Live ${ticker} share price on ${exchange}, with an intraday chart, key statistics, financials and news on Finvoq.`
  };
}

export default function StockSymbolPage({ params }: Props) {
  // StockDetail talks to the quote API, so it needs the ".NS"/".BO" form.
  // Legacy ".NS" URLs still resolve, since toApiSymbol passes them through.
  return <StockDetail symbol={toApiSymbol(params.symbol)} />;
}
