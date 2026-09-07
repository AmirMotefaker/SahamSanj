import { writeFile } from "node:fs/promises";

const tracked = new Set(["فولاد", "فملی", "شستا", "کگل", "شبندر"]);
const query = new URLSearchParams({ market: "0", withBestLimits: "false", hEven: "0", RefID: "0" });
for (let index = 0; index < 9; index += 1) query.set(`paperTypes[${index}]`, String(index + 1));

const response = await fetch(`https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?${query}`, { headers: { "user-agent": "SahamSanj/0.1 (public market snapshot)" } });
if (!response.ok) throw new Error(`Market source returned ${response.status}`);
const payload = await response.json();

function findRows(value) {
  if (Array.isArray(value) && value.some((item) => item && typeof item === "object" && ("lVal18AFC" in item || "symbol" in item))) return value;
  if (value && typeof value === "object") for (const child of Object.values(value)) { const found = findRows(child); if (found) return found; }
  return null;
}

const rows = findRows(payload);
if (!rows) throw new Error("Market response had no recognizable quote rows");
const symbols = rows.filter((row) => tracked.has(row.lVal18AFC ?? row.symbol)).map((row) => ({
  symbol: row.lVal18AFC ?? row.symbol,
  last: Number(row.pDrCotVal ?? row.last ?? null),
  closing: Number(row.pClosing ?? row.close ?? null),
  changePercent: Number(row.priceChangePercent ?? row.percent ?? null),
  volume: Number(row.qTotTran5J ?? row.volume ?? null),
  value: Number(row.qTotCap ?? row.value ?? null),
}));
if (symbols.length < 2) throw new Error("Market response did not include enough tracked symbols");

await writeFile("public/market-snapshot.json", JSON.stringify({ updatedAt: new Date().toISOString(), source: "TSETMC public market data", symbols }, null, 2) + "\n");
