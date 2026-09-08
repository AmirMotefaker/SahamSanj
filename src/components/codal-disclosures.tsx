"use client";

import { useEffect, useState } from "react";

type Disclosure = {
  id: string;
  title: string;
  publishedAt: string;
  url: string | null;
};

type CodalPayload = {
  Letters?: Array<Record<string, unknown>>;
};

const gateway = "https://sahamsanj-market-gateway.amotef.workers.dev";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function CodalDisclosures({ symbol }: { symbol: string }) {
  const [items, setItems] = useState<Disclosure[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 9000);

    const load = async () => {
      try {
        const response = await fetch(`${gateway}/codal?symbol=${encodeURIComponent(symbol)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("codal source unavailable");

        const payload = (await response.json()) as CodalPayload;
        const disclosures = (payload.Letters ?? []).slice(0, 4).map((letter, index) => ({
          id: normalize(letter.TracingNo ?? letter.tracingNo) || `${symbol}-${index}`,
          title: normalize(letter.Title ?? letter.title) || "اطلاعیهٔ بدون عنوان",
          publishedAt: normalize(letter.PublishDateTime ?? letter.publishDateTime ?? letter.SentDateTime),
          url: normalize(letter.Url ?? letter.url) || null,
        }));

        setItems(disclosures);
        setState("ready");
      } catch {
        setItems([]);
        setState("unavailable");
      } finally {
        window.clearTimeout(timer);
      }
    };

    const kickoff = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(kickoff);
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [symbol]);

  return (
    <section className="panel" aria-live="polite">
      <div className="panel-head">
        <div>
          <p className="eyebrow">منبع رسمی</p>
          <h2>آخرین اطلاعیه‌های کدال · {symbol}</h2>
        </div>
        <span className="sample-badge">{state === "ready" ? "دریافت مستقیم" : state === "loading" ? "در حال دریافت" : "در دسترس نیست"}</span>
      </div>
      {state === "ready" ? (
        <div className="comparison-table">
          {items.length ? items.map((item) => (
            <div className="table-row" key={item.id}>
              <div><b>{item.title}</b><small>{item.publishedAt || "زمان انتشار اعلام نشده"}</small></div>
              {item.url ? <a className="text-button" href={`https://codal.ir${item.url.startsWith("/") ? item.url : `/${item.url}`}`} target="_blank" rel="noreferrer">مشاهده در کدال</a> : <span>—</span>}
            </div>
          )) : <p>برای این نماد اطلاعیه‌ای در پاسخ فعلی دریافت نشد.</p>}
        </div>
      ) : <p>{state === "loading" ? "در حال خواندن اطلاعیه‌های رسمی…" : "منبع کدال فعلاً پاسخ نداد؛ دادهٔ نمونه جایگزین نشده است."}</p>}
    </section>
  );
}
