"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Quote = {
  symbol: string;
  last: number | null;
  closing: number | null;
  changePercent: number | null;
};

type MarketState = "loading" | "ready" | "unavailable";

const trackedSymbols = new Set(["فولاد", "فملی", "شستا", "کگل", "شبندر"]);

function buildMarketUrl() {
  const query = new URLSearchParams({
    market: "0",
    withBestLimits: "false",
    hEven: "0",
    RefID: "0",
  });

  for (let index = 0; index < 9; index += 1) {
    query.set(`paperTypes[${index}]`, String(index + 1));
  }

  return `https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?${query}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function findRows(value: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(value)) {
    const rows = value.filter(isRecord);
    if (rows.some((row) => "lVal18AFC" in row || "symbol" in row)) return rows;
    for (const item of value) {
      const nested = findRows(item);
      if (nested) return nested;
    }
    return null;
  }

  if (isRecord(value)) {
    for (const nestedValue of Object.values(value)) {
      const nested = findRows(nestedValue);
      if (nested) return nested;
    }
  }

  return null;
}

function toNumber(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatPrice(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("fa-IR").format(value);
}

function formatPercent(value: number | null) {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 2,
  }).format(value)}٪`;
}

export function LiveMarketRibbon() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [state, setState] = useState<MarketState>("loading");
  const [receivedAt, setReceivedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setState("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch(buildMarketUrl(), {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`market source returned ${response.status}`);

      const payload: unknown = await response.json();
      const rows = findRows(payload);
      if (!rows) throw new Error("market response had no recognized quote rows");

      const freshQuotes = rows
        .map((row) => ({
          symbol: String(row.lVal18AFC ?? row.symbol ?? ""),
          last: toNumber(row.pDrCotVal ?? row.last),
          closing: toNumber(row.pClosing ?? row.close),
          changePercent: toNumber(row.priceChangePercent ?? row.percent),
        }))
        .filter((quote) => trackedSymbols.has(quote.symbol));

      if (freshQuotes.length < 2) throw new Error("not enough requested symbols returned");

      setQuotes(freshQuotes);
      setReceivedAt(new Date());
      setState("ready");
    } catch {
      setQuotes([]);
      setState("unavailable");
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(kickoff);
  }, [refresh]);

  const receivedText = useMemo(
    () =>
      receivedAt
        ? new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(receivedAt)
        : null,
    [receivedAt],
  );

  return (
    <section className="live-ribbon" aria-live="polite">
      <div className="live-ribbon__meta">
        <span className={`live-ribbon__dot live-ribbon__dot--${state}`} />
        <span>{state === "ready" ? "تابلوی عمومی؛ دریافت مستقیم" : state === "loading" ? "در حال دریافت مستقیم تابلو…" : "دریافت مستقیم فعلاً در دسترس نیست"}</span>
        {receivedText ? <span className="live-ribbon__time">دریافت: {receivedText}</span> : null}
        <button className="live-ribbon__refresh" onClick={() => void refresh()} type="button" disabled={state === "loading"}>
          به‌روزرسانی
        </button>
      </div>

      {state === "ready" ? (
        <div className="live-ribbon__quotes">
          {quotes.map((quote) => (
            <div className="live-ribbon__quote" key={quote.symbol}>
              <strong>{quote.symbol}</strong>
              <span>{formatPrice(quote.last ?? quote.closing)}</span>
              <em className={quote.changePercent !== null && quote.changePercent < 0 ? "is-negative" : ""}>{formatPercent(quote.changePercent)}</em>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
