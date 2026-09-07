import { demoSymbols } from "@/lib/demo-data";

export default function ComparePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold text-teal-300">ط§طھط§ظ‚ طھطµظ…غŒظ… آ· ظ†ط³ط®ظ‡ ظ†ظ…ط§غŒط´غŒ</p>
        <h1 className="mt-3 text-3xl font-black">ظ…ظ‚ط§غŒط³ظ‡ ط³ظ‡ ظ†ظ…ط§ط¯</h1>
        <p className="mt-3 text-slate-300">ط§ظ…طھغŒط§ط²ظ‡ط§ ظ†ظ…ظˆظ†ظ‡ ظ‡ط³طھظ†ط¯ ظˆ طھط§ ط²ظ…ط§ظ† ظ…ط¬ظˆط² ظ…ع©طھظˆط¨ ط¯ط§ط¯ظ‡طŒ ط¯ط§ط¯ظ‡ ط²ظ†ط¯ظ‡ ظ†ظ…ط§غŒط´ ط¯ط§ط¯ظ‡ ظ†ظ…غŒâ€Œط´ظˆط¯.</p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[720px] text-right">
            <thead className="border-b border-slate-800 text-sm text-slate-400"><tr><th className="p-4">ظ†ظ…ط§ط¯</th><th>ظ†ظ‚ط¯ط´ظˆظ†ط¯ع¯غŒ</th><th>طھط§ط¨â€Œط¢ظˆط±غŒ</th><th>ط¨ظ†غŒط§ط¯غŒ</th><th>ط§ظپط´ط§</th><th className="p-4">ط§ظ…طھغŒط§ط² ط´ظپط§ظپ</th></tr></thead>
            <tbody>{demoSymbols.map((item) => {
              const score = Math.round((item.liquidity + item.resilience + item.fundamentals + item.disclosure) / 4);
              return <tr className="border-b border-slate-800" key={item.symbol}><td className="p-4 font-bold">{item.symbol}<span className="mr-2 text-xs font-normal text-slate-400">{item.name}</span></td><td>{item.liquidity}</td><td>{item.resilience}</td><td>{item.fundamentals}</td><td>{item.disclosure}</td><td className="p-4 font-black text-teal-300">{score}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
