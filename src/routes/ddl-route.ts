import { Elysia } from "elysia";
import {
  getFacultyController,
  createFacultyController,
} from "../controllers/faculty-controller";

export const ddlRoutes = new Elysia()
  .post("/faculty", getFacultyController)
  .post("/faculty/add", createFacultyController);
