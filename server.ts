import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./server/api"; // We will create this

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON 解析中介軟體
  app.use(express.json());

  // 掛載後端 API 路由
  app.use("/api", apiRouter);

  // 掛載上傳圖片等靜態資源
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Vite 中介軟體配置 (開發模式熱更新與靜態資源)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA Fallback: 任何未找到的路由都回傳 index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server gracefully started and running on port ${PORT}`);
  });
}

startServer();
