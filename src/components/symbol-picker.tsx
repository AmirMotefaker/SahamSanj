"use client";

import { useEffect, useRef, useState } from "react";

const gateway = "https://sahamsanj-market-gateway.amotef.workers.dev";

type Candidate = {
  id: string;
  symbol: string;
};

type Props = {
  index: number;
  value: string;
  onChange: (value: string) => void;
};

const digits = "۰۱۲۳۴۵۶۷۸۹";

function fa(value: string) {
  return value.replace(/\d/g, (digit) => digits[Number(digit)]);
}

export default function SymbolPicker({
  index,
  value,
  onChange,
}: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const term = value.trim();

    if (term.length < 2) {
      return;
    }

    const currentRequest = ++requestId.current;

    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${gateway}/traders/resolve?q=${encodeURIComponent(term)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("catalog unavailable");
        }

        const payload = (await response.json()) as {
          candidates?: Candidate[];
        };

        if (currentRequest !== requestId.current) return;

        const unique = Array.from(
          new Map(
            (payload.candidates ?? [])
              .filter((item) => item.id && item.symbol)
              .map((item) => [item.id, item])
          ).values()
        ).slice(0, 12);

        setCandidates(unique);
        setFallback(false);
        setOpen(true);
      } catch {
        if (currentRequest !== requestId.current) return;

        setCandidates([]);
        setFallback(true);
        setOpen(true);
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <label className="relative block text-sm font-bold text-slate-700">
      نماد {fa(String(index + 1))}

      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (value.trim().length >= 2) setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder="مثلاً فولاد، فملی یا تاپیکو"
        dir="auto"
        autoComplete="off"
        className="mt-2 block w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-teal-600"
      />

      {open ? (
        <div className="absolute right-0 left-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {loading ? (
            <p className="px-4 py-3 font-normal text-slate-500">
              در حال جست‌وجوی نمادها…
            </p>
          ) : candidates.length ? (
            <>
              <p className="border-b border-slate-100 px-4 py-2 text-xs font-normal text-slate-500">
                پیشنهادهای عمومی
              </p>

              <div className="max-h-72 overflow-y-auto">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(candidate.symbol);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-right transition hover:bg-slate-50"
                  >
                    <strong>{candidate.symbol}</strong>
                    <span className="text-xs font-normal text-slate-400">
                      انتخاب
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : fallback ? (
            <div className="px-4 py-4">
              <p className="font-bold text-slate-800">
                فهرست پیشنهادها موقتاً در دسترس نیست
              </p>
              <p className="mt-1 text-xs font-normal leading-6 text-slate-500">
                می‌توانی نام نماد یا شناسه را همچنان وارد کنی؛ صفحه حذف یا با
                Failed to fetch متوقف نمی‌شود.
              </p>
            </div>
          ) : (
            <div className="px-4 py-4">
              <p className="font-bold text-slate-800">
                نتیجه‌ای برای این عبارت پیدا نشد
              </p>
              <p className="mt-1 text-xs font-normal leading-6 text-slate-500">
                نام دقیق نماد، مثل «فملی»، «فولاد» یا «تاپیکو» را امتحان کن.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </label>
  );
}
