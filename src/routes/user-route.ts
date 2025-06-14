// src/routes/user-route.ts
import { Elysia } from "elysia";
import {
  registerController,
  loginController,
  getAllUsersController,
  deleteUserController,
  changePasswordController,
} from "../controllers/user-controller";

export const userRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", registerController)
  .post("/login", loginController)
  .get("/users", getAllUsersController)
  .delete("/users/:id", deleteUserController)
  .post("/change-password", changePasswordController);
