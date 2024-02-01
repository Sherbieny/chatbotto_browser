# チャットボットアプリ (ブラウザ)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![GitHub repo size](https://img.shields.io/github/repo-size/Sherbieny/chatbot-browser-app) ![GitHub last commit](https://img.shields.io/github/last-commit/Sherbieny/chatbot-browser-app)

これは、[Chatbotto](https://github.com/Sherbieny/chatbotto)アプリケーションのブラウザベースのバージョンです。

## 使用されたライブラリ

- [Framework7](https://framework7.io/): モバイルファーストデザインを作成するために使用されます。
- [RakutenMA](https://github.com/rakuten-nlp/rakutenma): 日本語の言語分析に使用されます。

## データストレージ

このアプリケーションでは、元のアプリケーションの MongoDB の代わりに、[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)を使用して、ブラウザー上の必要なデータを保存します。

## セットアップ

アプリケーションをセットアップするには、プロジェクトのルートディレクトリで Web サーバーを起動します。これは、framework7 のルーティングが正常に機能するようにするために必要です。

### 例:

#### PHP サーバー

```bash
php -S localhost:8000
```

#### Python サーバー

```bash
python -m http.server 8000
```

## 使い方

- チャットボットと対話するには、ホームページに移動します。アプリケーションの設定を構成するには、管理ページに移動します。
- 初回使用:
  - 管理ページに移動し、`QA`ボタンをクリックして QA ファイルをアップロードします。ファイルは JSON/CSV 形式である必要があり、`sample_data`ディレクトリの`qa_data`ファイルと同じ構造に従う必要があります。
  - `BCCWJ`ボタンをクリックして、BCCWJ ファイルをアップロードします。ファイルは JSON/CSV 形式である必要があり、`sample_data`ディレクトリの`weights`ファイルと同じ構造に従う必要があります。
- 必要なファイルをアップロードしたら、ページをリロードして、データテーブルに BCCWJ の重みが表示されるようにします。データテーブルで重みを編集し、IndexedDB に保存することができます。

## ツールとテクノロジー

- [VS Code](https://code.visualstudio.com/)
- [Github Copilot](https://copilot.github.com/)
- [Github Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## 貢献

貢献は歓迎します。プルリクエストを送信するか、問題を作成して、行いたい変更を議論してください。

# Chatbotto Browser App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![GitHub repo size](https://img.shields.io/github/repo-size/Sherbieny/chatbot-browser-app) ![GitHub last commit](https://img.shields.io/github/last-commit/Sherbieny/chatbot-browser-app)

This is a browser-based version of the [Chatbotto](https://github.com/Sherbieny/chatbotto) application.

## Libraries Used

- [Framework7](https://framework7.io/): Used for creating a mobile-first design.
- [RakutenMA](https://github.com/rakuten-nlp/rakutenma): Used for Japanese language analysis.

## Data Storage

Instead of MongoDB in the original application, this application uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to save the necessary data on the browser.

## Setup

To set up the application, simply start a web server in the root directory of the project. This is needed to allow framework7 routing to work properly.

### Examples:

#### PHP Server

```bash
php -S localhost:8000
```

#### Python Server

```bash
python -m http.server 8000
```

## Usage

- Navigate to the home page to interact with the chatbot. Go to the admin page to configure application settings.
- First time usage:
  - Go to the admin page and click on the `QA` button to upload a QA file. The file should be in JSON/CSV format and should follow the same structure as in the `qa_data` file in `sample_data` directory.
  - Click on the `BCCWJ` button to upload a BCCWJ file. The file should be in JSON/CSV format and should follow the same structure as in the `weights` file in `sample_data` directory.
- After uploading the necessary files, reload the page to see the BCCWJ weights in the data table. The weights can be edited in the data table and saved to IndexedDB.

## Tools and Technologies

- [VS Code](https://code.visualstudio.com/)
- [Github Copilot](https://copilot.github.com/)
- [Github Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes you want to make.
