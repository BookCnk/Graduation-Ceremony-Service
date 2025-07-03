import { Elysia } from "elysia";
import {
  getFacultyController,
  createFacultyController,
  deleteFacultyController,
  createGraduateController,
} from "../controllers/faculty-controller";

export const ddlRoutes = new Elysia()
  .post("/faculty", getFacultyController)
  .post("/faculty/add", createFacultyController)
  .delete(
    "/faculty/:id",
    async ({ params }) => await deleteFacultyController({ params })
  )
  .post("/import/grad", createGraduateController);