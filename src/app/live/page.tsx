"use client";

import { useCallback, useEffect, useState } from "react";

type Fields = Record<"shareCount" | "marketValue" | "floatPercentage" | "eps" | "pe" | "groupPe", string | null>;
type Profile = { source: string; sourceUrl: string; fetchedAt: string; fields: Fields };
type History = { sourceUrl: string; fetchedAt: string; columns: string[]; rows: string[][] };

const gateway = "https://sahamsanj-market-gateway.amotef.workers.dev";
const id = "46348559193224090";

const fundamentals: Array<[keyof Fields, string]> = [
  ["marketValue", "ارزش بازار"],
  ["eps", "سود هر سهم"],
  ["pe", "نسبت قیمت به سود"],
  ["groupPe", "نسبت قیمت به سود گروه"],
  ["floatPercentage", "سهام شناور"],
  ["shareCount", "تعداد سهام"],
];

const historyColumns = [
  "تاریخ", "ردیف", "حجم معاملات", "ارزش معاملات",
  "آخرین قیمت", "درصد تغییر آخرین", "قیمت پایانی", "درصد تغییر پایانی",
  "سرانه خرید حقیقی", "سرانه فروش حقیقی", "قدرت خرید حقیقی", "ورود پول حقیقی",
  "قدرت خرید پنج‌روزه", "قدرت خرید بیست‌روزه", "ورود پول پنج‌روزه", "ورود پول بیست‌روزه",
];

const digits = "۰۱۲۳۴۵۶۷۸۹";
function fa(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .replace(/\bB\b/g, "میلیارد")
    .replace(/\bM\b/g, "میلیون")
    .replace(/\d/g, (digit) => digits[Number(digit)]);
}

function time(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  }).format(new Date(value));
}

export default function LivePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileResponse, historyResponse] = await Promise.all([
        fetch(`${gateway}/traders/symbol?id=${id}`, { cache: "no-store" }),
        fetch(`${gateway}/traders/history?id=${id}`, { cache: "no-store" }),
      ]);

      if (!profileResponse.ok || !historyResponse.ok) {
        throw new Error("دریافت دادهٔ عمومی ناموفق بود.");
      }

      const nextProfile = (await profileResponse.json()) as Profile;
      const nextHistory = (await historyResponse.json()) as History;

      if (!nextProfile.fields.marketValue || !nextHistory.rows?.length) {
        throw new Error("دادهٔ عمومی برای نمایش کامل نیست.");
      }

      setProfile(nextProfile);
      setHistory(nextHistory);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "دریافت داده در دسترس نیست.");
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

  const latest = history?.rows[0];
  const highlights = latest
    ? [
        ["آخرین قیمت", latest[4], "ریال"],
        ["تغییر آخرین قیمت", latest[5], "درصد"],
        ["حجم معاملات", latest[2], ""],
        ["ارزش معاملات", latest[3], ""],
        ["قدرت خرید حقیقی", latest[10], "برابر"],
        ["ورود پول حقیقی", latest[11], ""],
      ]
    : [];

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-teal-700">دادهٔ عمومی، بدون ذخیره‌سازی</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">نمای زندهٔ نماد فولاد</h1>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              همهٔ اعداد به فارسی نمایش داده می‌شوند. این صفحه فقط برای مشاهده و مقایسهٔ داده است و توصیهٔ خرید یا فروش نیست.
            </p>
          </div>
          <button onClick={() => void refresh()} disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-teal-800 disabled:opacity-60">
            {loading ? "در حال دریافت…" : "به‌روزرسانی داده"}
          </button>
        </header>

        {error ? <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-900">{error}</section> : null}

        {!profile && loading ? <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}</div> : null}

        {profile && history ? <>
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 bg-gradient-to-l from-teal-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-teal-700">فولاد مبارکه اصفهان</p>
                <h2 className="mt-1 text-3xl font-black">فولاد</h2>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
                زمان دقیق دریافت داده: <strong>{time(profile.fetchedAt)}</strong>
              </div>
            </div>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
              {fundamentals.map(([key, label]) => <div key={key} className="border-t border-slate-100 p-5">
                <dt className="text-sm font-bold text-slate-500">{label}</dt>
                <dd className="mt-2 text-xl font-black">{fa(profile.fields[key])}</dd>
              </div>)}
            </dl>
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between">
              <div><p className="text-sm font-bold text-teal-700">خلاصهٔ آخرین روز قابل مشاهده</p><h2 className="text-2xl font-black">اعداد مهم در یک نگاه</h2></div>
              <span className="text-sm text-slate-500">تاریخ: {fa(latest?.[0])}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map(([label, value, unit]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black">{fa(value)} {unit}</p>
              </article>)}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-bold text-teal-700">سوابق عمومی</p><h2 className="text-2xl font-black">آخرین {fa(String(history.rows.length))} ردیف قابل مشاهده</h2></div>
              <a href={history.sourceUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-bold">مشاهدهٔ منبع</a>
            </div>
            <p className="px-5 pt-4 text-sm text-slate-500">«زمان دریافت داده» زمان خواندن صفحه است؛ منبع برای ردیف‌های تاریخی ساعت معامله منتشر نکرده است.</p>
            <div className="overflow-x-auto p-5">
              <table className="min-w-[1700px] w-full text-right text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>{historyColumns.map((label) => <th key={label} className="whitespace-nowrap px-3 py-3 font-black">{label}</th>)}<th className="whitespace-nowrap px-3 py-3 font-black">زمان دریافت داده</th></tr>
                </thead>
                <tbody>
                  {history.rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="border-b border-slate-100 hover:bg-teal-50">
                    {historyColumns.map((_, columnIndex) => <td key={columnIndex} className="whitespace-nowrap px-3 py-3">{fa(row[columnIndex])}</td>)}
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{time(history.fetchedAt)}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            داده در گیت‌هاب یا پایگاه‌داده ذخیره نمی‌شود؛ در هر به‌روزرسانی مستقیم از منبع عمومی خوانده می‌شود.
          </section>
        </> : null}
      </div>
    </main>
  );
}