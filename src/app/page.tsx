import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-5 text-sm font-semibold text-teal-300">ط³ظ‡ظ…â€Œط³ظ†ط¬ آ· ط§طھط§ظ‚ طھطµظ…غŒظ… ط³ظ‡ط§ظ…â€Œط¯ط§ط±</p>
        <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">ظ…ظ‚ط§غŒط³ظ‡ ط´ظپط§ظپ ع†ظ†ط¯ ط³ظ‡ظ…طŒ ظ¾غŒط´ ط§ط² طھطµظ…غŒظ….</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">غ² طھط§ غ±غ° ظ†ظ…ط§ط¯ ط±ط§ ط¨ط§ ظ…ط¹غŒط§ط±ظ‡ط§غŒ ظ‚ط§ط¨ظ„ ظپظ‡ظ… ظ…ظ‚ط§غŒط³ظ‡ ع©ظ†ط› ظˆط²ظ† ظ…ط¹غŒط§ط±ظ‡ط§ ط±ط§ ط®ظˆط¯طھ طھط¹غŒغŒظ† ع©ظ† ظˆ ط¯ظ„غŒظ„ ظ‡ط± ط±طھط¨ظ‡ ط±ط§ ط¨ط¨غŒظ†.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link className="rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950" href="/compare">ط´ط±ظˆط¹ ظ…ظ‚ط§غŒط³ظ‡ ظ†ظ…ظˆظ†ظ‡</Link>
          <span className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300">ط¨ط¯ظˆظ† ط³غŒع¯ظ†ط§ظ„ ط®ط±غŒط¯ ظˆ ظپط±ظˆط´</span>
        </div>
      </section>
    </main>
  );
}
