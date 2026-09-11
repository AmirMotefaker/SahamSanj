"use client";

import { useState } from "react";

type Fields = Record<
  "shareCount" | "marketValue" | "floatPercentage" | "eps" | "pe" | "groupPe",
  string | null
>;

type Profile = {
  sourceUrl: string;
  fetchedAt: string;
  symbol?: string;
  fields: Fields;
};

type History = {
  fetchedAt: string;
  rows: string[][];
};

type Item = {
  id: string;
  profile: Profile;
  history: History | null;
};

const gateway = "https://sahamsanj-market-gateway.amotef.workers.dev";
const digits = "۰۱۲۳۴۵۶۷۸۹";

const basicRows: Array<[keyof Fields, string]> = [
  ["marketValue", "ارزش بازار"],
  ["eps", "سود هر سهم"],
  ["pe", "نسبت قیمت به سود"],
  ["groupPe", "نسبت قیمت به سود گروه"],
  ["floatPercentage", "سهام شناور"],
  ["shareCount", "تعداد سهام"],
];

const historyLabels = [
  "تاریخ",
  "ردیف",
  "حجم معاملات",
  "ارزش معاملات",
  "آخرین قیمت",
  "درصد تغییر آخرین قیمت",
  "قیمت پایانی",
  "درصد تغییر قیمت پایانی",
  "سرانه خرید حقیقی",
  "سرانه فروش حقیقی",
  "قدرت خرید حقیقی",
  "ورود پول حقیقی",
  "قدرت خرید حقیقی ۵ روزه",
  "قدرت خرید حقیقی ۲۰ روزه",
  "ورود پول حقیقی ۵ روزه",
  "ورود پول حقیقی ۲۰ روزه",
];

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

function normalize(value: string) {
  return value
    .trim()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

async function resolve(value: string) {
  const term = value.trim();

  if (!term) return { term, id: null as string | null };

  const direct = term.match(/\d{8,24}/)?.[0];
  if (direct) return { term, id: direct };

  const response = await fetch(
    `${gateway}/traders/resolve?q=${encodeURIComponent(term)}`,
    { cache: "no-store" }
  );

  if (!response.ok) return { term, id: null as string | null };

  const payload = (await response.json()) as {
    candidates?: Array<{ id: string; symbol: string }>;
  };

  const found = payload.candidates?.find(
    (candidate) => normalize(candidate.symbol) === normalize(term)
  );

  return { term, id: found?.id ?? null };
}

function latest(item: Item, index: number) {
  return item.history?.rows?.[0]?.[index] ?? null;
}

function score(item: Item) {
  const basics = basicRows.filter(([key]) => Boolean(item.profile.fields[key])).length;
  const history = historyLabels.filter((_, index) => Boolean(latest(item, index))).length;

  return ((basics + history) / (basicRows.length + historyLabels.length)) * 10;
}

export default function ComparePage() {
  const [input, setInput] = useState(["فولاد", "فزر", "عیار"]);
  const [data, setData] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function compare() {
    const entered = input.map((value) => value.trim()).filter(Boolean);

    if (entered.length < 2) {
      setData([]);
      setError("دست‌کم دو نماد، شناسه یا لینک عمومیِ متفاوت وارد کن.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resolved = await Promise.all(entered.map(resolve));
      const unresolved = resolved.filter((item) => !item.id).map((item) => item.term);

      if (unresolved.length) {
        setData([]);
        setError(`برای «${unresolved.join("»، «")}» نماد عمومیِ دقیق پیدا نشد.`);
        return;
      }

      const ids = resolved.map((item) => item.id as string);

      if (new Set(ids).size !== ids.length) {
        setData([]);
        setError("یک نماد بیش از یک‌بار وارد شده است؛ نمادهای متفاوت انتخاب کن.");
        return;
      }

      const result = await Promise.all(
        ids.map(async (id) => {
          const [profileResponse, historyResponse] = await Promise.all([
            fetch(`${gateway}/traders/symbol?id=${id}`, { cache: "no-store" }),
            fetch(`${gateway}/traders/history?id=${id}`, { cache: "no-store" }),
          ]);

          if (!profileResponse.ok) {
            throw new Error("یکی از پروفایل‌های عمومی قابل دریافت نیست.");
          }

          return {
            id,
            profile: (await profileResponse.json()) as Profile,
            history: historyResponse.ok
              ? ((await historyResponse.json()) as History)
              : null,
          };
        })
      );

      setData(result);
    } catch (cause) {
      setData([]);
      setError(
        cause instanceof Error ? cause.message : "دریافت دادهٔ عمومی ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  const ranking = [...data]
    .map((item) => ({ id: item.id, score: score(item) }))
    .sort((a, b) => b.score - a.score);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-teal-700">دادهٔ عمومی و قابل‌ردگیری</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">مقایسهٔ نمادها</h1>
            <p className="mt-2 text-base leading-7 text-slate-600">
              داده‌های عمومی کنار هم نمایش داده می‌شوند؛ این صفحه توصیهٔ خرید یا فروش نیست.
            </p>
          </div>
          <a href="/SahamSanj/live/" className="rounded-xl border border-slate-300 px-4 py-2 text-center font-bold">
            نمای یک نماد
          </a>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-4">
            {input.map((value, index) => (
              <label key={index} className="text-sm font-bold text-slate-700">
                نماد {fa(String(index + 1))}
                <input
                  value={value}
                  onChange={(event) =>
                    setInput((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      )
                    )
                  }
                  placeholder="مثلاً فولاد، فزر یا عیار"
                  dir="auto"
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-teal-600"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => void compare()}
              disabled={loading}
              className="min-h-12 rounded-2xl bg-slate-950 px-5 font-bold text-white disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "در حال دریافت…" : "مقایسهٔ نمادها"}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            نام نماد، شناسه یا لینک عمومی تریدرزآرنا را وارد کن؛ هیچ ورودیِ حل‌نشده‌ای بی‌صدا حذف نمی‌شود.
          </p>
        </section>

        {error ? (
          <section className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-900">
            {error}
          </section>
        ) : null}

        {data.length ? (
          <>
            <section className="mt-6 rounded-3xl border border-teal-100 bg-teal-50 p-5">
              <p className="text-sm font-bold text-teal-700">نتیجهٔ مقایسه</p>
              <h2 className="mt-1 text-2xl font-black">{fa(String(data.length))} نماد مقایسه شد</h2>
              <p className="mt-2 text-sm text-slate-600">
                {data.map((item) => item.profile.symbol || "نماد عمومی").join("، ")}
              </p>
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-3">
              {data.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="font-bold text-teal-700">پروفایل عمومی</p>
                  <h2 className="mt-1 text-2xl font-black">{item.profile.symbol || "نماد عمومی"}</h2>
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <p>ارزش بازار<strong className="mt-1 block text-base text-slate-950">{fa(item.profile.fields.marketValue)}</strong></p>
                    <p>آخرین قیمت<strong className="mt-1 block text-base text-slate-950">{fa(latest(item, 4))}</strong></p>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">زمان دریافت: {time(item.profile.fetchedAt)}</p>
                </article>
              ))}
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <p className="font-bold text-teal-700">معیارهای پایه</p>
                <h2 className="mt-1 text-2xl font-black">اطلاعات عمومی شرکت یا صندوق</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-right">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-4">معیار</th>
                      {data.map((item) => <th className="p-4" key={item.id}>{item.profile.symbol || "نماد عمومی"}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {basicRows.map(([key, label]) => (
                      <tr className="border-t border-slate-200" key={key}>
                        <th className="bg-slate-50 p-4">{label}</th>
                        {data.map((item) => <td className="p-4 font-black" key={item.id}>{fa(item.profile.fields[key])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <p className="font-bold text-teal-700">آخرین روز معاملاتی قابل مشاهده</p>
                <h2 className="mt-1 text-2xl font-black">تمام معیارهای عمومی سوابق</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[920px] w-full text-right">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-4">معیار</th>
                      {data.map((item) => <th className="p-4" key={item.id}>{item.profile.symbol || "نماد عمومی"}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {historyLabels.map((label, index) => (
                      <tr className="border-t border-slate-200" key={label}>
                        <th className="bg-slate-50 p-4">{label}</th>
                        {data.map((item) => <td className="p-4 font-black" key={item.id}>{fa(latest(item, index))}</td>)}
                      </tr>
                    ))}
                    <tr className="border-t-2 border-teal-700 bg-teal-50">
                      <th className="p-4 font-black">امتیاز پوشش داده‌های عمومی</th>
                      {data.map((item) => {
                        const value = score(item);
                        const rank = ranking.findIndex((entry) => entry.id === item.id) + 1;
                        return (
                          <td className="p-4 font-black" key={item.id}>
                            {fa(value.toFixed(1))} از ۱۰
                            <span className="mr-2 text-sm font-medium">رتبهٔ پوشش: {fa(String(rank))}</span>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
              امتیاز پوشش داده‌های عمومی فقط کامل‌بودن دادهٔ قابل مشاهده را می‌سنجد و رتبه‌بندی سرمایه‌گذاری یا پیشنهاد خرید و فروش نیست.
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}