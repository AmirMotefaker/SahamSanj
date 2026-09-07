"use client";

import { useEffect, useState } from "react";

type Quote = { symbol: string; last: number | null; changePercent: number | null; volume: number | null };
type Snapshot = { updatedAt: string; source: string; symbols: Quote[]; error?: string };

const number = new Intl.NumberFormat("fa-IR");

export function LiveMarketRibbon() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/AmirMotefaker/SahamSanj/chore/repository-foundation/public/market-snapshot.json", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: Snapshot) => { setSnapshot(data); setState(data.error ? "unavailable" : "ready"); })
      .catch(() => setState("unavailable"));
  }, []);

  if (state === "loading") return <section className="live-ribbon live-loading">در حال دریافت وضعیت بازار…</section>;
  if (state === "unavailable" || !snapshot) return <section className="live-ribbon live-unavailable">دادهٔ زندهٔ تابلو موقتاً در دسترس نیست؛ رتبه‌بندی با دادهٔ لحظه‌ای انجام نمی‌شود.</section>;

  return <section className="live-ribbon" aria-label="دادهٔ زندهٔ بازار">
    <div className="live-title"><span className="live-dot" /> تابلو بازار <small>منبع: {snapshot.source}</small></div>
    <div className="live-quotes">{snapshot.symbols.map((quote) => <div key={quote.symbol} className="live-quote"><b>{quote.symbol}</b><strong>{quote.last === null ? "—" : number.format(quote.last)}</strong><span className={quote.changePercent !== null && quote.changePercent < 0 ? "negative" : "positive"}>{quote.changePercent === null ? "—" : `${quote.changePercent > 0 ? "+" : ""}${number.format(quote.changePercent)}٪`}</span></div>)}</div>
    <time dateTime={snapshot.updatedAt}>به‌روزرسانی: {new Date(snapshot.updatedAt).toLocaleString("fa-IR")}</time>
  </section>;
}
