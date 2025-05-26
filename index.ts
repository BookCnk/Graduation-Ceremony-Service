// ✅ ตัวอย่าง index.ts ที่ถูกต้อง
import { Elysia } from "elysia";
import { userRoutes } from "@/routes/user-route";
import { db } from "@/config/db";

const app = new Elysia();

app.group(
  "/api/v1",
  (app) => app.use(userRoutes) // ✅ register routes ก่อน listen
);

app.get("/health", async () => {
  try {
    await db.query("SELECT 1");
    return { status: "ok", db: "connected" };
  } catch (err: any) {
    return { status: "error", db: "disconnected", message: err.message };
  }
});

app.listen(3000);

console.log("🚀 Server running at http://localhost:3000/api/v1");
