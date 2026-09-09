"use client";

import { useCallback, useState } from "react";

type Fields = Record<
  "shareCount" | "marketValue" | "floatPercentage" | "eps" | "pe" | "groupPe",
  string | null
>;

type Profile = {
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  fields: Fields;
};

const gateway = "https://sahamsanj-market-gateway.amotef.workers.dev";
const defaultId = "46348559193224090";
const digits = "۰۱۲۳۴۵۶۷۸۹";

const measures: Array<[keyof Fields, string]> = [
  ["marketValue", "ارزش بازار"],
  ["eps", "سود هر سهم"],
  ["pe", "نسبت قیمت به سود"],
  ["groupPe", "نسبت قیمت به سود گروه"],
  ["floatPercentage", "سهام شناور"],
  ["shareCount", "تعداد سهام"],
];

function fa(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replace(/\bB\b/g, "میلیارد")
    .replace(/\bM\b/g, "میلیون")
    .replace(/\d/g, (digit) => digits[Number(digit)]);
}

function profileId(value: string) {
  return value.match(/\d{8,24}/)?.[0] ?? null;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false,
  }).format(new Date(value));
}

export default function ComparePage() {
  const [inputs, setInputs] = useState([defaultId, "", ""]);
  const [profiles, setProfiles] = useState<Array<{ id: string; data: Profile }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInput = (index: number, value: string) => {
    setInputs((current) => current.map((item, itemIndex) => (
      itemIndex === index ? value : item
    )));
  };

  const compare = useCallback(async () => {
    const ids = inputs
      .map(profileId)
      .filter((value): value is string => Boolean(value));

    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length < 2) {
      setError("برای مقایسه، دست‌کم دو شناسه یا لینک عمومیِ متفاوت وارد کن.");
      setProfiles([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const responses = await Promise.all(
        uniqueIds.map(async (id) => {
          const response = await fetch(
            `${gateway}/traders/symbol?id=${id}`,
            { cache: "no-store" }
          );

          if (!response.ok) {
            throw new Error("یکی از پروفایل‌های عمومی قابل دریافت نیست.");
          }

          const data = (await response.json()) as Profile;

          if (!data.fields?.marketValue) {
            throw new Error("دادهٔ یکی از پروفایل‌ها برای مقایسه کامل نیست.");
          }

          return { id, data };
        })
      );

      setProfiles(responses);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "دریافت دادهٔ عمومی ناموفق بود."
      );
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [inputs]);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-teal-700">مقایسهٔ دادهٔ عمومی</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">مقایسهٔ نمادها در یک نگاه</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
              تا سه پروفایل عمومی را وارد کن. این صفحه داده‌ها را کنار هم نمایش می‌دهد و هیچ توصیهٔ خرید یا فروش ارائه نمی‌کند.
            </p>
          </div>
          <a href="/SahamSanj/live/" className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-700">
            مشاهدهٔ یک نماد
          </a>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            {inputs.map((value, index) => (
              <label key={index} className="text-sm font-bold text-slate-700">
                پروفایل عمومی نماد {fa(String(index + 1))}
                <input
                  value={value}
                  onChange={(event) => updateInput(index, event.target.value)}
                  placeholder="شناسه یا لینک عمومی"
                  aria-label={`شناسه یا لینک عمومی نماد ${index + 1}`}
                  dir="ltr"
                  inputMode="numeric"
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-left font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => void compare()}
              disabled={loading}
              className="min-h-12 rounded-2xl bg-slate-950 px-6 font-bold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "در حال دریافت…" : "مقایسهٔ نمادها"}
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            لینک نمونه: https://tradersarena.ir/46348559193224090
          </p>
        </section>

        {error ? (
          <section className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
            <p className="font-black">مقایسه انجام نشد</p>
            <p className="mt-1 text-sm">{error}</p>
          </section>
        ) : null}

        {profiles.length > 0 ? (
          <>
            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              {profiles.map(({ id, data }, index) => (
                <article key={id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-teal-700">نماد {fa(String(index + 1))}</p>
                  <h2 className="mt-1 break-all text-xl font-black">شناسهٔ {fa(id)}</h2>
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <dt className="text-sm text-slate-500">ارزش بازار</dt>
                      <dd className="mt-1 font-black">{fa(data.fields.marketValue)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">سود هر سهم</dt>
                      <dd className="mt-1 font-black">{fa(data.fields.eps)}</dd>
                    </div>
                  </dl>
                  <p className="mt-5 text-sm text-slate-500">زمان دریافت: {formatTime(data.fetchedAt)}</p>
                </article>
              ))}
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <p className="text-sm font-bold text-teal-700">جدول هم‌ردیف</p>
                <h2 className="mt-1 text-2xl font-black">معیارهای پایهٔ قابل مشاهده</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[850px] w-full text-right text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-5 py-4 font-black">معیار</th>
                      {profiles.map(({ id }, index) => (
                        <th key={id} className="px-5 py-4 font-black">
                          نماد {fa(String(index + 1))} — {fa(id)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {measures.map(([key, label]) => (
                      <tr key={key} className="border-t border-slate-100">
                        <th className="whitespace-nowrap bg-slate-50 px-5 py-4 font-bold text-slate-700">{label}</th>
                        {profiles.map(({ id, data }) => (
                          <td key={id} className="whitespace-nowrap px-5 py-4 font-black">{fa(data.fields[key])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <p className="font-bold text-slate-900">شفافیت داده</p>
              <p className="mt-1 leading-6">
                هر ستون از همان پروفایل عمومی دریافت شده است. داده در گیت‌هاب یا پایگاه‌داده ذخیره نمی‌شود.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {profiles.map(({ id, data }, index) => (
                  <a key={id} href={data.sourceUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-700">
                    منبع نماد {fa(String(index + 1))}
                  </a>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}