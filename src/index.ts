import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors"; 
import { userRoutes } from "@/routes/user-route";
import { ddlRoutes } from "@/routes/ddl-route";
import { db } from "@/config/db";
import { apiRoutes } from "@/routes/graduate-route";

const app = new Elysia({ adapter: node() });

// ✅ ใช้งาน CORS ก่อนใช้งาน routes
app.use(
  cors({
    origin: "*", // หรือใส่ whitelist เช่น: ['http://localhost:5173']
    credentials: true,
  })
);

// ✅ Register routes
app.group("/api/v1", (group) =>
  group.use(userRoutes).use(ddlRoutes).use(apiRoutes)
);

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
