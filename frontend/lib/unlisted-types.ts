export type PricePoint = [string, number];
export type InvestorDocument = {
  id: string;
  title: string;
  type: string;
  year: string;
  source_url: string;
  available?: boolean;
  checked_at?: string;
};
export type FinancialTable = { title: string; rows: string[][] };
