import { Elysia } from "elysia";
import {
  getGraduatesController,
  getQuotaGroupsController,
  saveQuotaGroupsController,
  showQuotaData,
  RemainingNotReceivedByEarliestRound,
  getFirstGraduateNotReceivedController,
  getRoundCallSummaryController,
  getNextGraduatesAfterFirstController,
  setGraduateAsReceivedController,
  resetReceivedCardsController,
} from "../controllers/graduate-controller";

export const apiRoutes = new Elysia()
  .post("/graduates", getGraduatesController)
  .get("/quota-groups", async () => await getQuotaGroupsController())
  .post(
    "/quota-groups/save",
    async ({ body }) => await saveQuotaGroupsController({ body })
  )
  .get("/quota-summary", async () => await showQuotaData())
  .get(
    "/remaining-not-received",
    async () => await RemainingNotReceivedByEarliestRound()
  )
  .get(
    "/first-not-received",
    async () => await getFirstGraduateNotReceivedController()
  )

  .get("/round-call-summary", async () => await getRoundCallSummaryController())
  .get(
    "/next-graduates",
    async () => await getNextGraduatesAfterFirstController()
  )
  .post(
    "/set-received",
    async ({ body }: { body: { id: any } }) => await setGraduateAsReceivedController({ body })
  )
  .post("/reset-cards", resetReceivedCardsController);
