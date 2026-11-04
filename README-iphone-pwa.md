# マイメロ壁紙 iPhone版（PWA v35）

このブランチ `ios-pwa` は iPhone向けPWA専用です。Android版の `main` および既存の `iphone-pwa` は変更しません。

## 公開に必要なファイル
ZIPの `iphone-v35/dist/` の**中身**を、このブランチのリポジトリ直下にアップロードしてください（`index.html`、`manifest.webmanifest`、`sw.js`、`icons/`）。

## 確認・公開
1. 上記ファイルを追加してコミットすると、WebKit自動テストが実行されます。
2. テスト成功後、GitHub Pagesが公開されます。
3. PagesのURLをiPhoneのSafariで開き、共有→「ホーム画面に追加」を選んでください。

注意：これはiOSのPWAです。iOSの仕様上、ホーム画面・ロック画面に常駐するライブ壁紙ではありません。音声・Wake LockなどはiPhone実機で別途確認が必要です。
