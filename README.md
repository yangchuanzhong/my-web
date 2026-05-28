# 全端電商網站系統 (Full-Stack E-Commerce System)

## 📁 專案結構說明 (Project Structure)

本專案採用 Node.js (Express) 與 React 的前後端分離架構，並同源部署 (SSR/Middleware 整合機制)。

### 【前端架構 (Frontend - React)】
- \`src/main.tsx\`: 應用程式進入點。
- \`src/App.tsx\`: 定義 React Router 統一管理前端路由。
- \`src/store/\`: 狀態管理模組，提供 \`AuthContext\` (管理登入與 JWT)、\`CartContext\` (購物車同步)。
- \`src/pages/\`: 各獨立頁面，包含 首頁(Home)、登入/註冊(Auth)、購物車(Cart)、結帳頁面(Checkout)。
- \`src/components/\`: 共用 UI 元件，如導覽列(Navbar)、商品卡片(ProductCard)。
- \`src/lib/api.ts\`: 封裝所有與後端溝通的 Fetch 請求，自動夾帶 JWT Headers。

### 【後端架構 (Backend - Node.js / Express)】
- \`server.ts\`: Node.js 主程式進入點，設定 Express 通訊與整合 Vite 開發伺服器。
- \`server/api.ts\`: 後端核心路由器，包含 Auth 認證、Products 讀取、Cart 管理與 Payment 模擬金流結帳。
- \`server/db.ts\`: 核心資料庫整合層 (以 In-Memory / Array 形式模擬，便於輕量化部署，生產環境可輕易替換為 MySQL/PostgreSQL)。

### 【部署層 (Deployment)】
- \`Dockerfile\`: 提供兩階段構建 (Multi-stage Build) 映像檔配置，自動化編譯前端資源並啟動後端伺服器。
- \`docker-compose.yml\`: 可以透過單一指令 \`docker-compose up -d\` 建立並執行包含環境變數配置的完整服務。

---

## 📚 API 文件範例 (API Documentation)

所有 API 統一由 \`/api/*\` 開頭，且回傳格式皆為 JSON。

### 1. 會員驗證模組 (Authentication)
*   **POST** \`/api/auth/register\`
    *   說明：新使用者註冊
    *   Payload: \`{ "username": "test", "password": "123" }\`
    *   Response: \`{ "message": "User created", "user": { ... } }\`
*   **POST** \`/api/auth/login\`
    *   說明：使用者登入，核發 JWT 憑證
    *   Payload: \`{ "username": "test", "password": "123" }\`
    *   Response: \`{ "token": "ey...", "user": { "id": "u1", "username": "test" } }\`

### 2. 商品模組 (Products)
*   **GET** \`/api/products\`
    *   說明：獲取商店產品列表
    *   Response: \`[{ "id": "p1", "name": "...", "price": 999 }] \`

### 3. 購物車模組 (Cart) - [需要 Authorization: Bearer {token}]
*   **GET** \`/api/cart\`
    *   說明：獲取當前登入用戶的購物車內容
*   **POST** \`/api/cart\`
    *   說明：新增或更新商品至購物車
    *   Payload: \`{ "productId": "p1", "quantity": 1 }\`
*   **DELETE** \`/api/cart/:productId\`
    *   說明：移除購物車特定商品

### 4. 金流結帳模組 (Checkout / Payment) - [需要 Authorization: Bearer {token}]
*   **POST** \`/api/checkout\`
    *   說明：提交結帳資訊並模擬扣款
    *   Payload: \`{ "address": "...", "creditCard": "...", "totalAmount": 999 }\`
    *   Response: \`{ "success": true, "orderId": "ORD-1234", "message": "Payment successful" }\`
