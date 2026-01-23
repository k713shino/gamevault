# GameVault

ボードゲームコレクション管理アプリケーション

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## 🎲 概要

**GameVault**は、ボードゲーム愛好家のためのコレクション管理Webアプリです。所持しているゲーム、欲しいゲーム、貸出中のゲームを一元管理し、いつでもどこでもコレクションを確認できます。

### デモ

🔗 **https://gamevault-beta.vercel.app/**

## ✨ 機能

- **📦 コレクション管理** - ゲームの登録・編集・削除
- **🔍 検索・フィルタ** - タイトル、カテゴリ、ステータスで絞り込み
- **🖼️ 画像アップロード** - ゲームの画像を登録
- **📱 レスポンシブ対応** - スマホでもPCでも快適に使用
- **🔐 ユーザー認証** - 個人のコレクションを安全に管理

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| 認証・DB | Supabase (PostgreSQL) |
| ストレージ | Supabase Storage |
| ホスティング | Vercel |

## 📁 プロジェクト構成

```
src/
├── app/
│   ├── page.tsx              # トップページ
│   ├── login/page.tsx        # ログイン
│   ├── signup/page.tsx       # 新規登録
│   └── games/
│       ├── page.tsx          # ゲーム一覧
│       ├── new/page.tsx      # 新規登録
│       └── [id]/
│           ├── page.tsx      # 詳細
│           └── edit/page.tsx # 編集
├── components/
│   └── AuthForm.tsx          # 認証フォーム
└── lib/
    ├── supabase.ts           # Supabaseクライアント
    └── types.ts              # 型定義
```

## 🚀 セットアップ

### 必要条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/k713shino/gamevault.git
cd gamevault

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集してSupabaseの認証情報を設定
```

### 環境変数

`.env.local` ファイルに以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabaseセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. 以下のSQLを実行してテーブルを作成：

```sql
CREATE TABLE public.games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  image_url text,
  player_count_min integer,
  player_count_max integer,
  play_time integer,
  category text,
  status text NOT NULL DEFAULT 'owned',
  memo text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view own games" ON public.games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own games" ON public.games
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own games" ON public.games
  FOR DELETE USING (auth.uid() = user_id);
```

3. Storageで `game-images` バケットを作成（Public）

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## 📊 データモデル

### Game

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | uuid | 主キー |
| user_id | uuid | ユーザーID |
| title | text | ゲームタイトル |
| image_url | text | 画像URL |
| player_count_min | integer | 最少プレイ人数 |
| player_count_max | integer | 最大プレイ人数 |
| play_time | integer | プレイ時間（分） |
| category | text | カテゴリ |
| status | text | ステータス（owned/wishlist/lent） |
| memo | text | メモ |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

## 🎨 スクリーンショット

### トップページ
ログイン前のランディングページ

### ゲーム一覧
グリッド/リスト表示の切り替え、検索・フィルタ機能

### ゲーム詳細
ゲーム情報の詳細表示、編集・削除

## 🔮 今後の予定

- [ ] プレイ人数でのフィルタ
- [ ] ソート機能
- [ ] 貸出管理（誰に貸したか記録）
- [ ] プレイ記録
- [ ] BGG API連携
- [ ] 統計ダッシュボード

## 👤 作者

**YUSUKE**

- ボードゲームイベント主催（霧島市）
- ボードゲーム情報サイト「Sound of Strategy」運営

## 📝 ライセンス

MIT License

---

⭐ このプロジェクトが気に入ったら、スターをお願いします！