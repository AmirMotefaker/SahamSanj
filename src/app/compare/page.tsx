"use client";
import { useState } from "react";

type F=Record<"shareCount"|"marketValue"|"floatPercentage"|"eps"|"pe"|"groupPe",string|null>;
type P={sourceUrl:string;fetchedAt:string;symbol?:string;fields:F};
const g="https://sahamsanj-market-gateway.amotef.workers.dev";
const ds="۰۱۲۳۴۵۶۷۸۹";
const rows:Array<[keyof F,string]>=[["marketValue","ارزش بازار"],["eps","سود هر سهم"],["pe","نسبت قیمت به سود"],["groupPe","نسبت قیمت به سود گروه"],["floatPercentage","سهام شناور"],["shareCount","تعداد سهام"]];

function fa(v:string|null|undefined){return v?v.replace(/\bB\b/g,"میلیارد").replace(/\bM\b/g,"میلیون").replace(/\d/g,d=>ds[Number(d)]):"—"}
function id(v:string){return v.match(/\d{8,24}/)?.[0]??null}
function normalizeSymbol(v:string){return v.trim().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\s+/g," ").toLowerCase()}
async function resolvePublicId(value:string){
  const direct=id(value);
  if(direct)return direct;

  const term=value.trim();
  if(!term)return null;

  const response=await fetch(`${g}/traders/resolve?q=${encodeURIComponent(term)}`,{cache:"no-store"});
  if(!response.ok)return null;

  const payload=(await response.json()) as {candidates?:Array<{id:string;symbol:string}>};
  const wanted=normalizeSymbol(term);
  return payload.candidates?.find(candidate=>normalizeSymbol(candidate.symbol)===wanted)?.id??null;
}
function time(v:string){return new Intl.DateTimeFormat("fa-IR",{dateStyle:"short",timeStyle:"medium",hour12:false}).format(new Date(v))}

export default function ComparePage(){
  const [input,setInput]=useState(["46348559193224090","",""]);
  const [data,setData]=useState<Array<{id:string;p:P}>>([]);
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);

  async function compare(){
    const resolved=await Promise.all(input.map(resolvePublicId));
    const ids=[...new Set(resolved.filter((x):x is string=>Boolean(x)))];
    if(ids.length<2){setError("دست‌کم دو نماد، شناسه یا لینک عمومیِ متفاوت وارد کن.");setData([]);return}
    setLoading(true);setError("");
    try{
      const result=await Promise.all(ids.map(async x=>{
        const r=await fetch(`${g}/traders/symbol?id=${x}`,{cache:"no-store"});
        if(!r.ok)throw new Error("یکی از پروفایل‌های عمومی قابل دریافت نیست.");
        const p=await r.json() as P;
        if(!p.fields.marketValue)throw new Error("دادهٔ یک پروفایل کامل نیست.");
        return {id:x,p};
      }));
      setData(result);
    }catch(e){setData([]);setError(e instanceof Error?e.message:"دریافت داده ناموفق بود.");}
    finally{setLoading(false)}
  }

  return <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-bold text-teal-700">دادهٔ عمومی و قابل‌ردگیری</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">مقایسهٔ نمادها</h1><p className="mt-2 text-slate-600">داده‌ها فقط کنار هم نمایش داده می‌شوند؛ این صفحه توصیهٔ خرید یا فروش نیست.</p></div>
        <a href="/SahamSanj/live/" className="rounded-xl border border-slate-300 px-4 py-2 text-center font-bold">نمای یک نماد</a>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-4">
          {input.map((v,i)=><label key={i} className="text-sm font-bold text-slate-700">نماد {fa(String(i+1))}
            <input value={v} onChange={e=>setInput(a=>a.map((x,n)=>n===i?e.target.value:x))} placeholder="مثلاً فولاد، فزر یا عیار" dir="ltr" className="mt-2 block w-full rounded-xl border border-slate-300 px-3 py-3 text-left font-normal outline-none focus:border-teal-600"/>
          </label>)}
          <button onClick={()=>void compare()} disabled={loading} className="min-h-12 rounded-2xl bg-slate-950 px-5 font-bold text-white disabled:opacity-60">{loading?"در حال دریافت…":"مقایسه"}</button>
        </div>
        <p className="mt-3 text-sm text-slate-500">نام نماد، شناسه یا لینک عمومی تریدرزآرنا را وارد کن.</p>
      </section>

      {error&&<section className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-900">{error}</section>}

      {data.length>0&&<><section className="mt-6 grid gap-4 lg:grid-cols-3">
        {data.map(({id,p},i)=><article key={id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-teal-700">نماد {fa(String(i+1))}</p><h2 className="mt-1 break-all text-xl font-black">{p.symbol || `نماد ${fa(String(i+1))}`}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4"><p>ارزش بازار<strong className="mt-1 block">{fa(p.fields.marketValue)}</strong></p><p>سود هر سهم<strong className="mt-1 block">{fa(p.fields.eps)}</strong></p></div>
          <p className="mt-4 text-sm text-slate-500">زمان دریافت: {time(p.fetchedAt)}</p>
        </article>)}
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b p-5"><p className="font-bold text-teal-700">جدول هم‌ردیف</p><h2 className="text-2xl font-black">معیارهای پایهٔ قابل مشاهده</h2></div>
        <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-right">
          <thead className="bg-slate-100"><tr><th className="p-4">معیار</th>{data.map(({id,p},i)=><th className="p-4" key={id}>{p.symbol || `نماد ${fa(String(i+1))}`}</th>)}</tr></thead>
          <tbody>{rows.map(([key,label])=><tr className="border-t" key={key}><th className="bg-slate-50 p-4">{label}</th>{data.map(({id,p})=><td className="p-4 font-black" key={id}>{fa(p.fields[key])}</td>)}</tr>)}</tbody>
        </table></div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">داده در گیت‌هاب یا پایگاه‌داده ذخیره نمی‌شود و هر بار مستقیم از منبع عمومی دریافت می‌شود.</section>
      </>}
    </div>
  </main>
}