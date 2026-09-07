export type ComparedSymbol = {
  symbol: string;
  name: string;
  liquidity: number;
  resilience: number;
  fundamentals: number;
  disclosure: number;
  freshness: string;
};

export const demoSymbols: ComparedSymbol[] = [
  { symbol: "ظپظˆظ„ط§ط¯", name: "ظپظˆظ„ط§ط¯ ظ…ط¨ط§ط±ع©ظ‡ ط§طµظپظ‡ط§ظ†", liquidity: 91, resilience: 74, fundamentals: 82, disclosure: 88, freshness: "ط¯ط§ط¯ظ‡ ظ†ظ…ظˆظ†ظ‡" },
  { symbol: "ظپظ…ظ„غŒ", name: "ظ…ظ„غŒ طµظ†ط§غŒط¹ ظ…ط³ ط§غŒط±ط§ظ†", liquidity: 87, resilience: 76, fundamentals: 85, disclosure: 86, freshness: "ط¯ط§ط¯ظ‡ ظ†ظ…ظˆظ†ظ‡" },
  { symbol: "ط´ط³طھط§", name: "ط³ط±ظ…ط§غŒظ‡â€Œع¯ط°ط§ط±غŒ طھط£ظ…غŒظ† ط§ط¬طھظ…ط§ط¹غŒ", liquidity: 82, resilience: 68, fundamentals: 70, disclosure: 79, freshness: "ط¯ط§ط¯ظ‡ ظ†ظ…ظˆظ†ظ‡" },
];
