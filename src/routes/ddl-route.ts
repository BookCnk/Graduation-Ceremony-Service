// src/routes/user-route.ts
import { Elysia } from "elysia";
import {
  getFacultyController, // ✅ เพิ่ม import
} from "../controllers/faculty-controller";

export const ddlRoutes = new Elysia().post("/faculty", getFacultyController);
