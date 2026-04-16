import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GameVault | ボードゲームコレクション管理",
    template: "%s | GameVault",
  },
  description:
    "ボードゲームのコレクションを管理・記録できるアプリ。所持状況、プレイ履歴、ウィッシュリストを一元管理。",
  keywords: ["ボードゲーム", "コレクション管理", "ゲーム記録", "ウィッシュリスト", "ボドゲ"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
          <p className="mb-2">関連サイト</p>
          <a
            href="https://my-boardgame-site.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
          >
            🎲 Dice Journal — 霧島市発のボードゲーム情報メディア
          </a>
          <p className="mt-3">© {new Date().getFullYear()} GameVault</p>
        </footer>
      </body>
    </html>
  );
}
