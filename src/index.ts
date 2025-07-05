import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { userRoutes } from "./routes/user-route";
import { ddlRoutes } from "./routes/ddl-route";
import { db } from "./config/db";
import { apiRoutes } from "./routes/graduate-route";

const app = new Elysia({ adapter: node() });

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.group("/api/v1", (group) =>
  group.use(userRoutes).use(ddlRoutes).use(apiRoutes)
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

import { io } from "socket.io-client";

const socket = io("ws://localhost:3002", {
  reconnectionDelayMax: 10000,
  query: {
    "my-key": "my-value",
  },
});

socket.on("connect", () => {
  console.log("connected");
  // client-side
  socket.emit("hello", "world");
});

