# Bubble Pad 設計ドキュメント

## 概要
Bubble Pad は、ブラウザのチャット欄でテキスト入力中の誤送信を防ぐための Chrome 拡張機能です。ショートカットキーでブラウザ内にフローティングテキストエリアを表示し、下書きを作成・コピーできます。

## 技術スタック
- **Vanilla TypeScript + Vite** — Content Script は軽量であるべきなので React 等は不使用
- **Chrome 拡張 Manifest V3**
- Vite の `build.rollupOptions` で複数エントリポイントビルド

## アーキテクチャ

### エントリポイント
1. **Background Script** (`background.ts`) — Service Worker として動作。`chrome.commands` API でショートカットキーを受信し、Content Script にメッセージを送信
2. **Content Script** (`content.ts`) — 各ページに注入。メッセージを受信して BubblePad の表示/非表示を切り替え

### BubblePad クラス
- **Shadow DOM** でページの CSS から完全に隔離
- `position: fixed` で画面右下にフローティング表示
- 初期サイズ: 幅 400px × 高さ 300px、リサイズ可能

#### 構成要素
- ヘッダー: タイトル + コピー/クリア/閉じるボタン
- テキストエリア: メインの入力領域
- フッター: 文字数表示

### 処理フロー
```
ユーザーが Alt+Shift+B を押す
  → background.ts (chrome.commands.onCommand)
  → chrome.tabs.sendMessage
  → content.ts (chrome.runtime.onMessage)
  → BubblePad.toggle()
```

## 機能詳細

### ショートカットキー: `Alt+Shift+B`
- `chrome.commands` API で拡張機能レベルで受信（ページのイベントと競合しない）
- ユーザーが `chrome://extensions/shortcuts` でカスタマイズ可能

### コピー機能
- `navigator.clipboard.writeText()` を使用
- コピー成功時にボタンテキストが「Copied!」に一時変更

### ドラッグ移動
- ヘッダー部分をドラッグしてウィンドウを任意の位置に移動可能
- `mousedown`/`mousemove`/`mouseup` イベントで実装

### テキスト保持
- 非表示にしてもテキストはメモリ上に保持（同一タブのライフサイクル内）
- 永続化（`chrome.storage`）は初期バージョンでは未実装

## 権限（最小限）
- `clipboardWrite` — クリップボードへの書き込み
- `<all_urls>` — Content Script 注入に必要

## セキュリティ
- 外部 API 不使用、API キー不要
- Shadow DOM で CSS を隔離
- `keydown` イベントの `stopPropagation()` でページのショートカットと競合防止
- インラインスクリプト不使用（CSP 準拠）

## 検証方法
1. `npm run build` でビルドが成功すること
2. Chrome → `chrome://extensions` → 「パッケージ化されていない拡張機能を読み込む」で `dist/` を読み込み
3. 任意の Web ページで `Alt+Shift+B` を押してバブルパッドが表示されること
4. テキストを入力し、コピーボタンでクリップボードにコピーされること
5. 閉じるボタンまたは再度 `Alt+Shift+B` で非表示になること
6. 再表示時にテキストが保持されていること
7. ドラッグでウィンドウ移動ができること
