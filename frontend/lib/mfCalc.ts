// Pure financial calculations on real historical NAV series (from mfapi.in /
// AMFI data via our /api/mf proxy). No fabricated numbers — every figure here
// is derived from actual fetched NAV points.

export type NavPoint = { date: string; nav: string }; // date = "DD-MM-YYYY"

const parseDDMMYYYY = (d: string) => {
  const [dd, mm, yyyy] = d.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
};

/** NAV series sorted ascending by date, with numeric nav + Date parsed once. */
export type SortedNav = { date: Date; nav: number }[];

export const sortNavAscending = (data: NavPoint[]): SortedNav =>
  data
    .map((p) => ({ date: parseDDMMYYYY(p.date), nav: parseFloat(p.nav) }))
    .filter((p) => !isNaN(p.nav) && !isNaN(p.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

/** Nearest NAV on or after the given date (first trading day on/after). */
export const navOnOrAfter = (series: SortedNav, target: Date): SortedNav[number] | null => {
  for (const p of series) {
    if (p.date.getTime() >= target.getTime()) return p;
  }
  return null;
};

/** Nearest NAV on or before the given date (last trading day on/before). */
export const navOnOrBefore = (series: SortedNav, target: Date): SortedNav[number] | null => {
  let found: SortedNav[number] | null = null;
  for (const p of series) {
    if (p.date.getTime() <= target.getTime()) found = p;
    else break;
  }
  return found;
};

export const fmtINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const fmtINR2 = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Simulate a monthly SIP: on each SIP date between from/to, invest
 * `installment` at the nearest available NAV on/after that date.
 */
export function simulateSip(
  series: SortedNav,
  installment: number,
  sipDay: number,
  from: Date,
  to: Date
) {
  if (!series.length || installment <= 0 || from > to) return null;

  let totalUnits = 0;
  let totalInvested = 0;
  let installments = 0;
  const cursor = new Date(from.getFullYear(), from.getMonth(), sipDay);
  if (cursor < from) cursor.setMonth(cursor.getMonth() + 1);

  while (cursor <= to) {
    const point = navOnOrAfter(series, cursor);
    if (point && point.date <= to) {
      totalUnits += installment / point.nav;
      totalInvested += installment;
      installments++;
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (installments === 0) return null;

  const lastNav = navOnOrBefore(series, to) || series[series.length - 1];
  const currentValue = totalUnits * lastNav.nav;
  const gain = currentValue - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

  // Approximate annualised return (XIRR-like) via CAGR over the span.
  const years = (to.getTime() - from.getTime()) / (365.25 * 24 * 3600 * 1000);
  const cagr =
    years > 0 && totalInvested > 0
      ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100
      : 0;

  return {
    installments,
    totalInvested,
    totalUnits,
    currentValue,
    gain,
    gainPct,
    cagr,
    asOfNav: lastNav.nav,
    asOfDate: lastNav.date
  };
}

/** Point-to-point return between two dates. Annualised (CAGR) if span > 1yr. */
export function trailingReturn(series: SortedNav, years: number, asOf?: Date) {
  if (!series.length) return null;
  const end = asOf ? navOnOrBefore(series, asOf) : series[series.length - 1];
  if (!end) return null;
  const startTarget = new Date(end.date);
  startTarget.setFullYear(startTarget.getFullYear() - years);
  const start = navOnOrAfter(series, startTarget) || series[0];
  if (!start || start.date >= end.date) return null;

  const spanYears =
    (end.date.getTime() - start.date.getTime()) / (365.25 * 24 * 3600 * 1000);
  const totalReturn = (end.nav - start.nav) / start.nav;
  const pct =
    spanYears >= 0.95
      ? (Math.pow(end.nav / start.nav, 1 / spanYears) - 1) * 100
      : totalReturn * 100;

  return { pct, startNav: start.nav, endNav: end.nav, startDate: start.date, endDate: end.date };
}

/**
 * Simulate a Systematic Withdrawal Plan: invest `initial` lump sum, then
 * withdraw `withdrawal` every month between from/to, tracking unit depletion.
 */
export function simulateSwp(
  series: SortedNav,
  initial: number,
  withdrawal: number,
  from: Date,
  to: Date
) {
  if (!series.length || initial <= 0) return null;
  const startPoint = navOnOrAfter(series, from);
  if (!startPoint) return null;

  let units = initial / startPoint.nav;
  let totalWithdrawn = 0;
  let withdrawals = 0;
  let depletedOn: Date | null = null;

  const cursor = new Date(from);
  cursor.setMonth(cursor.getMonth() + 1);

  while (cursor <= to && units > 0) {
    const point = navOnOrAfter(series, cursor);
    if (point) {
      const unitsToRedeem = Math.min(units, withdrawal / point.nav);
      units -= unitsToRedeem;
      totalWithdrawn += unitsToRedeem * point.nav;
      withdrawals++;
      if (units <= 0.0001) {
        depletedOn = point.date;
        units = 0;
        break;
      }
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const lastNav = navOnOrBefore(series, to) || series[series.length - 1];
  const remainingValue = units * lastNav.nav;

  return {
    withdrawals,
    totalWithdrawn,
    remainingUnits: units,
    remainingValue,
    depletedOn,
    asOfDate: lastNav.date
  };
}
