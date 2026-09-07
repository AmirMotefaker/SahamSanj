import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-5 text-sm font-semibold text-teal-300">سهم‌سنج · اتاق تصمیم سهام‌دار</p>
        <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">مقایسه شفاف چند سهم، پیش از تصمیم.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">۲ تا ۱۰ نماد را با معیارهای قابل فهم مقایسه کن؛ وزن معیارها را خودت تعیین کن و دلیل هر رتبه را ببین.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link className="rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950" href="/compare">شروع مقایسه نمونه</Link>
          <span className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300">بدون سیگنال خرید و فروش</span>
        </div>
      </section>
    </main>
  );
}
