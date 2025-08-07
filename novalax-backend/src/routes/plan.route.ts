import { Router } from "express";
import planController from "src/controllers/plan.controller";

const planRouter = Router();

planRouter.post("/create", planController.createPlan);
planRouter.get("/get/by-account/:account", planController.getPlansByAccount);

export default planRouter;
