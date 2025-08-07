import { Router } from "express";
import subscriptionController from "src/controllers/subscription.controller";

const subscriptionRouter = Router();

subscriptionRouter.post("/create", subscriptionController.createNewSubscription);
subscriptionRouter.put("/update/item/:subscriptionId", subscriptionController.updateSubscriptionPlan);
subscriptionRouter.get("/get/by-payer/:payer", subscriptionController.getSubsByPayer);
subscriptionRouter.get("/get/by-telegram/:tg_id", subscriptionController.getSubsByUserTgId);

export default subscriptionRouter;
