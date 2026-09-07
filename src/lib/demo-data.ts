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
  { symbol: "فولاد", name: "فولاد مبارکه اصفهان", liquidity: 91, resilience: 74, fundamentals: 82, disclosure: 88, freshness: "داده نمونه" },
  { symbol: "فملی", name: "ملی صنایع مس ایران", liquidity: 87, resilience: 76, fundamentals: 85, disclosure: 86, freshness: "داده نمونه" },
  { symbol: "شستا", name: "سرمایه‌گذاری تأمین اجتماعی", liquidity: 82, resilience: 68, fundamentals: 70, disclosure: 79, freshness: "داده نمونه" },
];
