# Bubble Pad

ブラウザ上にフローティングテキストエリアを表示する Chrome 拡張機能です。
チャット欄での誤送信を防ぐために、下書きを作成してから入力欄に反映できます。

## 機能

- **Option+B** でフローティングテキストエリアの表示/非表示を切り替え
- 閉じると元のカーソル位置にテキストを自動挿入（Option+B で閉じた場合）
- Esc / 閉じるボタンはキャンセル（テキストは挿入されず Bubble Pad 内に保持）
- ドラッグ移動・全辺リサイズ対応
- Shadow DOM によるページ CSS からの完全隔離
- `<input>` / `<textarea>` / `contenteditable` に対応

## セットアップ

```bash
npm install
npm run build
```

## Chrome への読み込み

1. `chrome://extensions` を開く
2. 「デベロッパーモード」を ON にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `bubble-pad-extension/` フォルダを選択

## 技術スタック

- TypeScript + Vite
- Chrome Extensions Manifest V3
