import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"; // ✅ import plugin
import { userRoutes } from "@/routes/user-route";
import { db } from "@/config/db";

const app = new Elysia();

// ✅ ใช้งาน CORS ก่อนใช้งาน routes
app.use(
  cors({
    origin: "*", // หรือใส่ whitelist เช่น: ['http://localhost:5173']
    credentials: true,
  })
);

// ✅ Register routes
app.group("/api/v1", (app) => app.use(userRoutes));

// ✅ Health check
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
