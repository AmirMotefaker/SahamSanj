"use client";

import { useMemo, useState } from "react";

type ProfileKey = "محافظه‌کار" | "متعادل" | "رشدگرا";

const symbols = [
  { symbol: "فولاد", name: "فولاد مبارکه اصفهان", sector: "فلزات اساسی", price: "۲٬۹۶۴", change: "+۱٫۸٪", liquidity: 91, quality: 82, disclosure: 88, stability: 74, risk: "میانه" },
  { symbol: "فملی", name: "ملی صنایع مس ایران", sector: "فلزات اساسی", price: "۸٬۴۷۰", change: "+۰٫۹٪", liquidity: 87, quality: 85, disclosure: 86, stability: 76, risk: "میانه" },
  { symbol: "شستا", name: "سرمایه‌گذاری تأمین اجتماعی", sector: "چندرشته‌ای", price: "۱٬۳۹۲", change: "−۰٫۴٪", liquidity: 82, quality: 70, disclosure: 79, stability: 68, risk: "بالاتر" },
  { symbol: "کگل", name: "صنعتی و معدنی گل‌گهر", sector: "کانی غیرفلزی", price: "۶٬۱۳۰", change: "+۱٫۲٪", liquidity: 79, quality: 81, disclosure: 90, stability: 82, risk: "میانه" },
  { symbol: "شبندر", name: "پالایش نفت بندرعباس", sector: "فرآورده نفتی", price: "۱٬۰۸۴", change: "+۲٫۱٪", liquidity: 89, quality: 73, disclosure: 76, stability: 65, risk: "بالاتر" },
];

const profiles: Record<ProfileKey, { title: string; note: string; weights: [number, number, number, number] }> = {
  "محافظه‌کار": { title: "محافظه‌کار", note: "پایداری و شفافیت وزن بیشتری دارند.", weights: [20, 25, 25, 30] },
  "متعادل": { title: "متعادل", note: "بین کیفیت، نقدشوندگی و ریسک تعادل برقرار می‌شود.", weights: [25, 30, 25, 20] },
  "رشدگرا": { title: "رشدگرا", note: "کیفیت و نقدشوندگی وزن بیشتری می‌گیرند.", weights: [30, 35, 20, 15] },
};

const metricLabels = ["نقدشوندگی", "کیفیت بنیادی", "پایداری", "شفافیت افشا"];

export function DecisionRoom() {
  const [profile, setProfile] = useState<ProfileKey>("متعادل");
  const [selected, setSelected] = useState(["فولاد", "فملی", "شستا"]);
  const [activeMetric, setActiveMetric] = useState("امتیاز تصمیم");
  const weights = profiles[profile].weights;

  const ranked = useMemo(() => symbols
    .filter((item) => selected.includes(item.symbol))
    .map((item) => ({
      ...item,
      score: Math.round((item.liquidity * weights[0] + item.quality * weights[1] + item.stability * weights[2] + item.disclosure * weights[3]) / 100),
    }))
    .sort((a, b) => b.score - a.score), [selected, weights]);

  const toggleSymbol = (symbol: string) => {
    setSelected((current) => current.includes(symbol)
      ? current.length > 2 ? current.filter((item) => item !== symbol) : current
      : current.length < 5 ? [...current, symbol] : current);
  };

  return (
    <main className="app-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">س</span><span>سهم‌سنج</span></div>
        <nav className="nav-list" aria-label="ناوبری اصلی">
          <a className="nav-item active" href="#workspace"><span>◈</span> اتاق تصمیم</a>
          <a className="nav-item" href="#watchlist"><span>◎</span> فهرست‌های من</a>
          <a className="nav-item" href="#sources"><span>◌</span> کیفیت داده</a>
          <a className="nav-item" href="#journal"><span>◇</span> دفتر تصمیم</a>
        </nav>
        <div className="sidebar-foot"><span className="pulse" /> نسخهٔ نمایشی<br /><small>داده‌ها نمونه‌اند</small></div>
      </aside>

      <section className="workspace" id="workspace">
        <header className="topbar">
          <div><p className="eyebrow">اتاق تصمیم</p><h1>مقایسه، قبل از تصمیم</h1></div>
          <div className="top-actions"><button className="ghost-button">راهنمای امتیازدهی</button><button className="avatar" aria-label="پروفایل کاربر">ا</button></div>
        </header>

        <div className="notice"><span>i</span> این محیط برای آموزش و مقایسهٔ قابل‌توضیح است؛ توصیهٔ خرید یا فروش ارائه نمی‌کند.</div>

        <section className="control-grid" aria-label="کنترل‌های مقایسه">
          <article className="control-card profile-card">
            <div className="card-label">سبک تصمیم شما</div>
            <div className="segmented" role="group" aria-label="سبک تصمیم">
              {(Object.keys(profiles) as ProfileKey[]).map((item) => <button key={item} className={profile === item ? "selected" : ""} onClick={() => setProfile(item)}>{item}</button>)}
            </div>
            <p>{profiles[profile].note}</p>
          </article>
          <article className="control-card symbols-card">
            <div className="card-label">نمادهای مقایسه <b>{selected.length} از ۵</b></div>
            <div className="symbol-pills">{symbols.map((item) => <button key={item.symbol} className={selected.includes(item.symbol) ? "symbol-pill selected" : "symbol-pill"} onClick={() => toggleSymbol(item.symbol)}>{selected.includes(item.symbol) ? "✓ " : "+ "}{item.symbol}</button>)}</div>
            <p>حداقل دو نماد برای مقایسه نگه دارید.</p>
          </article>
        </section>

        <section className="ranking-section" aria-labelledby="ranking-title">
          <div className="section-heading"><div><p className="eyebrow">جمع‌بندی قابل‌ردگیری</p><h2 id="ranking-title">اولویت فعلی شما</h2></div><span className="sample-badge">دادهٔ نمونه</span></div>
          <div className="rank-grid">
            {ranked.map((item, index) => <article className={index === 0 ? "rank-card winner" : "rank-card"} key={item.symbol}>
              <div className="rank-top"><span className="rank-number">۰{index + 1}</span><span className="change">{item.change}</span></div>
              <h3>{item.symbol}</h3><p>{item.name}</p>
              <div className="score-line"><strong>{item.score}</strong><span>از ۱۰۰</span></div>
              <div className="progress"><i style={{ width: `${item.score}%` }} /></div>
              <small>{index === 0 ? "بهترین تعادل با معیارهای انتخاب‌شده" : item.risk === "بالاتر" ? "نوسان و پایداری نیازمند توجه بیشتر" : "نیازمند مقایسهٔ جزئی‌تر"}</small>
            </article>)}
          </div>
        </section>

        <section className="analysis-grid">
          <article className="panel comparison-panel">
            <div className="panel-head"><div><p className="eyebrow">جزئیات مقایسه</p><h2>معیارها در یک نگاه</h2></div><button className="text-button" onClick={() => setActiveMetric(activeMetric === "امتیاز تصمیم" ? "نقدشوندگی" : "امتیاز تصمیم")}>{activeMetric} ↙</button></div>
            <div className="metric-tabs">{["امتیاز تصمیم", ...metricLabels].map((metric) => <button key={metric} onClick={() => setActiveMetric(metric)} className={metric === activeMetric ? "selected" : ""}>{metric}</button>)}</div>
            <div className="comparison-table"><div className="table-head"><span>نماد</span><span>امتیاز</span><span>دلیل</span></div>{ranked.map((item) => {
              const value = activeMetric === "نقدشوندگی" ? item.liquidity : activeMetric === "کیفیت بنیادی" ? item.quality : activeMetric === "پایداری" ? item.stability : activeMetric === "شفافیت افشا" ? item.disclosure : item.score;
              return <div className="table-row" key={item.symbol}><div><b>{item.symbol}</b><small>{item.sector}</small></div><div className="value-bar"><i style={{ width: `${value}%` }} /><strong>{value}</strong></div><span>{value >= 85 ? "قوی" : value >= 75 ? "قابل‌قبول" : "نیازمند بررسی"}</span></div>;
            })}</div>
          </article>

          <article className="panel explanation-panel">
            <div className="panel-head"><div><p className="eyebrow">شفافیت مدل</p><h2>چرا این رتبه؟</h2></div></div>
            <p className="explain-lead"><b>{ranked[0]?.symbol}</b> با تنظیم «{profile}» در رتبهٔ نخست قرار گرفته است.</p>
            <div className="weights">{metricLabels.map((label, index) => <div key={label}><span>{label}</span><strong>{weights[index]}٪</strong><i><b style={{ width: `${weights[index] * 2.6}%` }} /></i></div>)}</div>
            <div className="source-box" id="sources"><span>◌</span><div><b>وضعیت منبع</b><p>نمونهٔ طراحی؛ اتصال دادهٔ زنده فقط پس از قرارداد و مجوز منبع فعال می‌شود.</p></div></div>
          </article>
        </section>

        <footer className="workspace-footer" id="journal"><span>آخرین به‌روزرسانی: دادهٔ نمونه</span><span>سهم‌سنج · تصمیم قابل‌توضیح</span></footer>
      </section>
    </main>
  );
}
