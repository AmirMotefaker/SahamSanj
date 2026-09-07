import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({ variable: "--font-vazirmatn", subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const metadata: Metadata = { title: "سهم‌سنج | اتاق تصمیم", description: "مقایسهٔ قابل‌توضیح نمادهای بازار سرمایه" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="fa" dir="rtl" className={vazirmatn.variable}><body>{children}</body></html>;
}
