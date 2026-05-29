# 💎 極緻選品 ｜ Gemini 智慧導購 & 綠界金流全棧電商平台

這是一個專為台灣精品選物設計的 **全棧式電子商務平台 (Full-Stack E-Commerce Platform)**。本專案前端採用 **React (TS) + Tailwind CSS**，後端底層基於 **Node.js + Express**，全網導入 **JWT 隨機認證金鑰** 與 **Bcrypt 密碼雜湊加密** 機制，並串接 **台灣綠界科技 (ECPay) 模擬金流收單測試沙盒** 進行完備的扣款與庫存扣減自動回傳。

此外，本專案首創導入最新的 **Google GenAI (Gemini 3.5-flash)** 技術，建構出可深度讀取在庫品名、規格與即時存量的 **「智慧導購 AI 客服專員」**，能依據最即時的庫存為顧客完成客製化商品推薦與購物引導。

---

## 🚀 專案核心亮點功能 (Core Features)

1. **行動裝置響應式精品體驗 (Mobile-First UI/UX)**
   - 全網採用 **Tailwind CSS 3/4** 與流暢微互動動畫（基於 **Motion** 庫），不論在桌機、平板或手機螢幕上均具備極佳的視差滾動與無縫側邊購物車收折體驗。
2. **完整購物車 & 免運門檻計算 (Shopping Cart Logic)**
   - 支援即時數量增減、在庫存水位安全上限檢查、一鍵商品移除，並內建「滿 NT$2,000 免運費，未達則自動計算 NT$80 運費」之動態提醒條。
3. **JWT 身份驗證安全防禦 (Security Header Verify)**
   - 使用 **jsonwebtoken** 派發 Bearer 加密認證標頭，買家註冊/登入均通過 10 級強度密碼雜湊（**bcryptjs**），後台管理 API 設有嚴格 JWT 的 role == "admin" 二次篩選，杜絕假冒管理權限安全漏洞。
4. **台灣綠界科技 (ECPay) 信用卡金流模擬 (Taiwan ECPay Integration)**
   - 獨創高還原度的綠界交易收銀頁面！顧客送出訂單後，點選「前往付款」會自動安全跳轉至模擬綠界刷卡防禦頁，輸入虛擬卡號送出後，綠界系統會即時向本平台派發 WebHook 支付成功 Callback (POST)，觸發**支付狀態更新 (`paid`)** 與 **在庫剩餘數量遞扣**。
5. **詳細營運後台管理面板 (Operational Admin Dashboard)**
   - **動態營運動態指標：** 手繪 SVG 響應式條形圖，即時顯示各商品分類銷售額與實收總營收。
   - **商品庫存管理：** 支援商品增、刪、改、查，並設有「當庫存低於 1 field (10件) 時自動亮起橘色警示燈」庫存預警。
   - **實體訂單處理：** 支援一鍵快速發貨、配送中貨態變更、取消/作廢整單作業。
6. **Gemini 智慧聯網導購助理 (AI Shopping Assistant)**
   - 搭載最新 `@google/genai` 管理套件。AI 助理在接到提問時，後端會自動將當前在庫的 `db.json` 所有商品售價與庫存注入系統 Instructions。AI 絕對不會推薦缺貨、斷貨或不存在的產品，且回覆中附帶的商品名支援直接轉換為前端「一鍵加購」快捷鍵！

---

## 🛠 本地環境參數配置說明 (Environment Setup)

在進行編譯、執行或部署前，請複製 `.env.example` 命名為 `.env` 並完成以下變數配置：

```env
# 1. 您的 Google Gemini API 金鑰 (請在 AI Studio secrets 中設定，或放置於 .env 檔案中)
# 取得金鑰：https://aistudio.google.com/
GEMINI_API_KEY="您的_GEMINI_API_KEY"

# 2. JWT 認證簽章專用私鑰 (若無配置，系統會預設隨機硬編碼 fallback 啟動)
JWT_SECRET="請輸入一長串隨機不易破解的密鑰字串"

# 3. 本地運行連接埠 (預設為 3000)
PORT=3000
```

---

## 🏃 快速開始與運行指令 (Running Commands)

確認您的機器已安裝 **Node.js (v18 建議以上)**：

### 1. 安裝套件
```bash
npm install
```

### 2. 本地開發偵錯 (Express 服務 + Vite 前端中介軟體)
此指令會自動在 `localhost:3000` 啟動一體化的全棧開發生態圈，支援 Vite 的資產極速載入：
```bash
npm run dev
```

### 3. 本地自動化測試 (NPM Testing Suite)
執行此指令會自動利用並行編譯對專案的資料庫讀寫、Bcrypt 雜湊加密演算法與 JWT 憑證簽發進行單元安全檢測：
```bash
npm test
```

### 4. 編譯與打包 (Production Build)
將前端打包進 `dist/`，並利用 `esbuild` 將 Express 服務端打包封裝成單一、高相容性的 CommonJS 模組 `dist/server.cjs`：
```bash
npm run build
```

### 5. 運行編譯成生產環境
```bash
npm start
```

---

## 👤 沙盒供測試帳號 (Pre-configured Test Accounts)

為了讓您能免去註冊程序快速檢驗後台角色更新與付款機制，資料庫會自動初始化以下兩組測試身分：

| 角色角色 | 電子信箱 Email Account | 預設密碼 Password | 身分優勢 |
|:---|:---|:---|:---|
| **買家會員** | `user@example.com` | `user123` | 能測試加入購物車、填寫收件地址、模擬卡號 ECPay 扣款 |
| **系統最高管理員** | `admin@example.com` | `admin` | 可完整使用「營運後台」進行上架、扣庫存、貨態重設 |

---

## 📈 SEO 搜尋引擎優化與擴充擴展

專案在架構上完全保留快速擴充與 SEO 標準：
1. **語意化 HTML：** 商品卡片、標題（`<h1>` 到 `<h4>`）、促銷看版資訊均經由 HTML5 標準修飾。
2. **SEO Meta 優化：** 在 `index.html` 中預留 meta descriptions 自訂接口，前端在商品詳細頁亦可使用 React Helmet (或動態標題機制) 帶入商品大名以利爬蟲收錄。
3. **資料庫獨立隔離：** 目前存檔基於自創持久化磁碟磁碟 `db.json`，在開發及單人部署時極具高速度低成本。若未來需要擴展為多租戶或萬級大流量，只需在 `/server.ts` 底層中將讀寫 `db.json` 改為連線遠端 MongoDB 或 PostgreSQL，其餘 JWT 與 AI 核心程式碼可 **100% 完好無損地重用**。

---

## 🔄 GitHub Actions 自動化 CI/CD 部署

本專案於 `/.github/workflows/deploy.yml` 配置了自動化交付管線控制。
當您將專案 push 至 `main` 分支時，GitHub 虛擬容器會自動執行：
1. 檢驗 Node 多版本交叉編譯
2. 進行 `npm run lint` 型別安全深度靜態檢測
3. 執行單元檢測 `npm test` 保障金鑰正確性
4. 編譯打包為壓縮 Production 物件，並視設定自動一鍵推送到您的 **Vercel** 雲端控制台。
