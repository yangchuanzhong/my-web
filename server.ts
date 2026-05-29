import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dns from "dns";

// Enable Node's native typescript resolution helper
const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "ecomm_platform_secret_key_998877";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// Database Layer (Local db.json storage)
// ----------------------------------------------------
interface FileDatabase {
  users: any[];
  products: any[];
  orders: any[];
}

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "智慧抗噪主動式無線耳機 Pro",
    description: "搭載最新40dB主動式降噪晶片，高精密聲學驅動單體，完美重現高解析音質。高達40小時超長續航力，具備智慧配戴感應與多點連接功能。",
    price: 4200,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    category: "影音娛樂",
    stock: 25,
    rating: 4.8,
    featured: true
  },
  {
    id: "prod-2",
    name: "極簡鋁合金高質感機械鍵盤 (熱插拔紅軸)",
    description: "採用太空級鋁合金全外殼，高精度噴砂陽極處理。支援Type-C與藍牙雙模連接、高熱插拔PCB插座及自訂RGB炫彩燈效，打字極致舒適安靜。",
    price: 2680,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    category: "電腦周邊",
    stock: 12,
    rating: 4.9,
    featured: true
  },
  {
    id: "prod-3",
    name: "GaN 65W 三合一氮化鎵極速充電器",
    description: "導入第三代GaN氮化鎵晶片，配備2個USB-C及1個USB-A接口。體積縮小35%，功率提升，搭載智能分配電流量技術，不傷機身不發燙。",
    price: 990,
    imageUrl: "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&auto=format&fit=crop&q=80",
    category: "手機配件",
    stock: 50,
    rating: 4.6,
    featured: false
  },
  {
    id: "prod-4",
    name: "手工雙層高硼矽水晶玻璃隨行杯 (500ml)",
    description: "全手工耐高低溫差高硼矽玻璃製成，防刮雙層結構防燙，附頂級人造皮革防滑握套。時尚外型，為日常補充水分注入美學態度。",
    price: 1200,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    category: "生活家居",
    stock: 30,
    rating: 4.5,
    featured: false
  },
  {
    id: "prod-5",
    name: "經典復古手撕感即時成像相機 Signature",
    description: "重拾溫潤沖洗手感，配備光圈與快門手動調節，精準測光。具備多重曝光模式、三檔對焦與可調式LED閃光燈，捕捉底片無可替代的雋永溫度。",
    price: 3500,
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
    category: "影音娛樂",
    stock: 8,
    rating: 4.7,
    featured: true
  },
  {
    id: "prod-6",
    name: "極致特選精品職人手沖咖啡器組 (六件組)",
    description: "包含不鏽鋼細口手沖壺、耐熱黑金砂濾杯、高刻度防割分享壺、黑胡桃木防震底座與高硼矽攪拌棒。送禮極致大方，享受慢活的午後微光。",
    price: 1800,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    category: "生活家居",
    stock: 15,
    rating: 4.9,
    featured: true
  },
  {
    id: "prod-7",
    name: "城市穿梭高密度全防潑水商務後背包",
    description: "採用一級軍規1680D雙股尼龍高強度織法，配備YKK防水防爆拉鏈。具備多層緩衝防撞隔層可完美收納16吋筆電，背部蜂巢透氣散熱網。",
    price: 2250,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    category: "個人品味",
    stock: 20,
    rating: 4.4,
    featured: false
  },
  {
    id: "prod-8",
    name: "極美極簡黑胡桃實木螢幕支撐增高架",
    description: "全黑胡桃進口實品木鋸切，無甲醛天然植物木蠟油塗裝。完美承重25公斤，底座可完整收納標準尺寸鍵盤與滑鼠，桌面凌亂完美救星。",
    price: 1590,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    category: "電腦周邊",
    stock: 18,
    rating: 4.7,
    featured: false
  }
];

function initDatabase(): FileDatabase {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse database file. Reinitializing...");
    }
  }

  // Create default records
  const adminSalt = bcrypt.genSaltSync(10);
  const userSalt = bcrypt.genSaltSync(10);

  const initialDB: FileDatabase = {
    users: [
      {
        id: "user-admin",
        email: "admin@example.com",
        password: bcrypt.hashSync("admin", adminSalt),
        name: "系統管理員",
        role: "admin"
      },
      {
        id: "user-customer",
        email: "user@example.com",
        password: bcrypt.hashSync("user123", userSalt),
        name: "王小明",
        role: "customer"
      }
    ],
    products: DEFAULT_PRODUCTS,
    orders: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
  return initialDB;
}

let db = initDatabase();

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ----------------------------------------------------
// Authentication middleware
// ----------------------------------------------------
function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "授權過期或不正確" });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: "未提供驗證金鑰" });
  }
}

function requireAdmin(req: any, res: any, next: any) {
  authenticateJWT(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "此功能需要管理員權限" });
    }
  });
}

// ----------------------------------------------------
// Auth Routes
// ----------------------------------------------------
app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "所有欄位均為必填" });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "此 Email 已被註冊" });
  }

  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, salt),
    name,
    role: "admin" as const
  };

  db.users.push(newUser);
  saveDatabase();

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "請輸入帳號與密碼" });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: "網址、電子信箱或密碼輸入錯誤" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.get("/api/auth/me", authenticateJWT, (req: any, res) => {
  res.json({
    user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }
  });
});

// ----------------------------------------------------
// Product Routes
// ----------------------------------------------------
app.get("/api/products", (req, res) => {
  res.json({ products: db.products });
});

app.post("/api/products", requireAdmin, (req, res) => {
  const { name, description, price, imageUrl, category, stock, featured } = req.body;

  if (!name || !description || price === undefined || !category || stock === undefined) {
    return res.status(400).json({ error: "缺少必填欄位" });
  }

  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    description,
    price: Number(price),
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
    category,
    stock: Number(stock),
    rating: 5.0,
    featured: !!featured
  };

  db.products.push(newProduct);
  saveDatabase();
  res.status(201).json({ product: newProduct });
});

app.put("/api/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "找不到該商品" });
  }

  const { name, description, price, imageUrl, category, stock, featured } = req.body;

  db.products[productIndex] = {
    ...db.products[productIndex],
    ...(name && { name }),
    ...(description && { description }),
    ...(price !== undefined && { price: Number(price) }),
    ...(imageUrl !== undefined && { imageUrl }),
    ...(category && { category }),
    ...(stock !== undefined && { stock: Number(stock) }),
    ...(featured !== undefined && { featured: !!featured })
  };

  saveDatabase();
  res.json({ product: db.products[productIndex] });
});

app.delete("/api/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "找不到該商品" });
  }

  const deleted = db.products.splice(productIndex, 1);
  saveDatabase();
  res.json({ success: true, message: "商品已成功刪除", deleted: deleted[0] });
});

// ----------------------------------------------------
// Order Routes
// ----------------------------------------------------
app.post("/api/orders", authenticateJWT, (req: any, res) => {
  const { items, shippingInfo, paymentMethod, remarks } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "購物車必須有商品才能下單" });
  }
  if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
    return res.status(400).json({ error: "請填寫完整訂購人收件資訊" });
  }

  // Double check stock & total amount
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = db.products.find((p) => p.id === item.id);
    if (!product) {
      return res.status(400).json({ error: `商品 ${item.id} 已絕版或不存在` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `商品 ${product.name} 庫存剩餘 ${product.stock} 件，庫存不足` });
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    });

    totalAmount += product.price * item.quantity;
  }

  // Deduct stock for products safely and instantly
  for (const item of items) {
    const prod = db.products.find((p) => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  const newOrder = {
    id: `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user.id,
    userEmail: req.user.email,
    items: orderItems,
    totalAmount,
    shippingInfo,
    remarks: remarks || "",
    paymentStatus: "paid" as const, // Automatically confirmed immediately
    paymentMethod: paymentMethod || "貨到付款/線下收款",
    orderStatus: "pending" as const,
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);
  saveDatabase();

  res.status(201).json({ order: newOrder });
});

app.get("/api/orders/my", authenticateJWT, (req: any, res) => {
  const myOrders = db.orders.filter((o) => o.userId === req.user.id);
  res.json({ orders: myOrders.reverse() });
});

app.get("/api/orders/all", requireAdmin, (req, res) => {
  res.json({ orders: db.orders.reverse() });
});

// Admin updates order status or mock pay
app.put("/api/orders/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const orderIndex = db.orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "找不到該訂單" });
  }

  const oldOrder = db.orders[orderIndex];

  db.orders[orderIndex] = {
    ...oldOrder,
    ...(orderStatus && { orderStatus }),
    ...(paymentStatus && { paymentStatus })
  };

  saveDatabase();
  res.json({ order: db.orders[orderIndex] });
});

// ----------------------------------------------------
// Gemini 3.5-flash Powered AI Shopping Assistant
// ----------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    // Lazy initialize to prevent startup crashes when key is temporarily absent
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}

app.post("/api/ai/assistant", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "無效的對話紀錄訊息列表。" });
  }

  // Pre-load current live inventory into instructions
  const productString = db.products
    .map(
      (p) =>
        `- 商品ID: ${p.id} | 品名: ${p.name} | 分類: ${p.category} | 價格: NT$ ${p.price} | 庫存餘額: ${p.stock} 件 | 商品簡介: ${p.description}`
    )
    .join("\n");

  const systemInstruction = `
    你是一個在「極緻選品館 E-Commerce Platform」工作的專業智慧導購 AI 服務專員。
    你的任務是親切、熱情地協助客戶了解商品、提供客製化推薦、並解答關於購物車或庫存的任何問題。
    請遵守以下規則：
    1. 你必須使用「繁體中文（台灣地區用語）」回覆，保持專業且有禮、帶有服務業溫度的語氣。
    2. 下面是館內目前【最即時、最準確的商品清單與庫存庫】：
    ${productString}
    3. 客戶詢問推薦時，請推薦 1 至 3 款「上面清單中實際存有」的商品，並說明推薦它的具體原因。
    4. 如果某商品庫存為 0，請誠實告訴用戶該商品目前已售罄，並探詢是否想看其他相似類別的庫存新品。
    5. 不要虛構館內不存在的商品或不符合的價格。
    6. 同時，告知使用者他們可以直接在左側點選該商品的「加入購物車」或直接點選前往結帳、體驗一鍵自動串接綠界金流付款。
    7. 保持回答簡潔、美觀，並使用 Markdown 來標記清單或粗體，方便閱讀。
  `;

  try {
    const ai = getAIClient();
    if (!ai) {
      // Graceful offline standard response if GEMINI_API_KEY is not defined yet
      return res.json({
        text: `【系統提醒：您尚未在 AI Studio 設置 GEMINI_API_KEY，目前正為您啟動「離線智慧導購導覽模組」】\n\n你好！我是極緻選品館的智慧導讀助理。由於目前 AI 金鑰尚未配置，但我依然可以為您介紹幾款館內熱門的嚴選好物：\n\n1. **智慧抗噪主動式無線耳機 Pro** ($4,200) - 降噪效果卓越，音樂愛好者必備！\n2. **極簡鋁合金高質感機械鍵盤** ($2,680) - 打字如行雲流水，高質感合金底盤。\n3. **極致特選精品職人手沖咖啡器組** ($1,800) - 讓你在辦公室也能優雅手沖，享受慢活美學。\n\n您可以在左側將心儀的好物加入購物車，或登入測試帳號（帳號: \`user@example.com\` 密碼: \`user123\`）來體驗完整的購物、綠界金流模擬、與後台管理喔！配置好金鑰後，我將能為您提供完整的智能客製化對談引導。`,
        success: true
      });
    }

    // Convert messages formatted for client state into Chat messages structure for SDK
    // The google genai SDK expects contents to build chat history.
    // Let's use simple message mapping
    const promptMessage = messages[messages.length - 1];
    const userPrompt = promptMessage?.text || "您好，有什麼嚴選商品推薦嗎？";

    // Format chat history for contents parameter (roles: user, model)
    const contents = [];
    // We only take the last 6 messages to keep tokens low and responses fast
    const recentMessages = messages.slice(-6);
    for (const msg of recentMessages) {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const replyText = response.text || "非常抱歉，我剛剛開了個小差，請再對我說一次。";
    res.json({ text: replyText, success: true });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "AI 模組呼叫發生錯誤",
      details: error.message,
      text: "非常抱歉，現在連線人數眾多，我的 AI 處理核心目前繁忙，但您依然可以將商品加入購物車體驗流暢的結帳金流！"
    });
  }
});

// ----------------------------------------------------
// Frontend Asset Integration / Vite Development
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-Commerce Server running on http://localhost:${PORT}`);
  });
}

startServer();
