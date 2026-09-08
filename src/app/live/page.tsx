"use client";

import { useCallback, useEffect, useState } from "react";

type PublicFields = {
  shareCount: string | null;
  marketValue: string | null;
  floatPercentage: string | null;
  eps: string | null;
  pe: string | null;
  groupPe: string | null;
};

type PublicProfile = {
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  persistence: "none";
  fields: PublicFields;
};

const endpoint =
  "https://sahamsanj-market-gateway.amotef.workers.dev/traders/symbol?id=46348559193224090";

const fieldLabels: Array<[keyof PublicFields, string]> = [
  ["marketValue", "ارزش بازار"],
  ["eps", "سود هر سهم"],
  ["pe", "نسبت قیمت به سود"],
  ["groupPe", "نسبت قیمت به سود گروه"],
  ["floatPercentage", "شناوری"],
  ["shareCount", "تعداد سهام"],
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LiveDataPage() {
  const [data, setData] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("دریافت داده از منبع عمومی ناموفق بود.");
      }

      const payload = (await response.json()) as PublicProfile;

      if (!payload.fields?.marketValue || !payload.fields?.eps) {
        throw new Error("دادهٔ دریافتی برای نمایش کامل نیست.");
      }

      setData(payload);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "دریافت داده در حال حاضر در دسترس نیست."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(kickoff);
  }, [refresh]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-teal-700">دادهٔ عمومی و قابل‌ردگیری</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              نمای زندهٔ نماد فولاد
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              داده‌های پایه از صفحهٔ عمومی منبع خوانده می‌شوند؛ این صفحه ابزار مشاهده و مقایسه است و توصیهٔ خرید یا فروش ارائه نمی‌کند.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "در حال دریافت داده..." : "به‌روزرسانی داده"}
          </button>
        </header>

        {error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
            <p className="font-bold text-rose-900">دادهٔ زنده فعلاً در دسترس نیست</p>
            <p className="mt-2 text-sm leading-6 text-rose-800">{error}</p>
          </section>
        ) : null}

        {!data && loading ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white"
              />
            ))}
          </section>
        ) : null}

        {data ? (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-5 border-b border-slate-100 bg-gradient-to-l from-teal-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-teal-700">فولاد مبارکه اصفهان</p>
                  <h2 className="mt-1 text-3xl font-black">فولاد</h2>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  آخرین دریافت: <span className="font-bold text-slate-900">{formatTime(data.fetchedAt)}</span>
                </div>
              </div>

              <dl className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
                {fieldLabels.map(([key, label]) => (
                  <div key={key} className="min-h-32 p-6">
                    <dt className="text-sm font-medium text-slate-500">{label}</dt>
                    <dd className="mt-3 text-xl font-black text-slate-950">
                      {data.fields[key] ?? "در دسترس نیست"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-900">شفافیت منبع</p>
                <p className="mt-1 leading-6">
                  داده در GitHub یا پایگاه داده ذخیره نمی‌شود و در هر به‌روزرسانی مستقیم از منبع عمومی دریافت می‌شود.
                </p>
              </div>
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 font-bold text-slate-800 transition hover:border-teal-600 hover:text-teal-700"
              >
                مشاهدهٔ منبع
              </a>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}