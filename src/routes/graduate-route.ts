import { Elysia } from "elysia";
import {
  getGraduatesController,
  getQuotaGroupsController,
} from "@/controllers/graduate-controller";

export const apiRoutes = new Elysia()
  .post("/graduates", getGraduatesController)
  .get("/quota-groups", async () => await getQuotaGroupsController());
