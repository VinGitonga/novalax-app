import { Request } from "express";
import { tryCatch } from "src/helpers/try-catch";
import subscriptionService from "src/services/subscription.service";
import { ExpressResponse } from "src/types/Api";

async function createNewSubscription(req: Request, res: ExpressResponse) {
	const { data, error } = await tryCatch(subscriptionService.createNewSubscription(req.body));

	if (error) {
		res.status(400).json({ status: "error", msg: "Unable to create subscription" });
		return;
	}

	res.status(200).json({ status: "success", data, msg: "Subscription created successfully" });
}

async function updateSubscriptionPlan(req: Request, res: ExpressResponse) {
	const subscriptionId = req.params.subscriptionId;
	const { data, error } = await tryCatch(subscriptionService.updateSubscriptionPlan(req.body, subscriptionId));

	if (error) {
		res.status(400).json({ status: "error", msg: "Unable to update subscription" });
		return;
	}

	res.status(200).json({ status: "success", data, msg: "Subscription updated successfully" });
}

async function getSubsByPayer(req: Request, res: ExpressResponse) {
	const payer = req.params.payer;

	const { data, error } = await tryCatch(subscriptionService.getSubsByPayer(payer));

	if (error) {
		res.status(400).json({ status: "error", msg: "Unable retrive the subscriptions" });
		return;
	}

	res.status(200).json({ status: "success", data, msg: "Subscription retrived successfully" });
}

async function getSubsByUserTgId(req: Request, res: ExpressResponse) {
	const tg_id = req.params.tg_id;

	const { data, error } = await tryCatch(subscriptionService.getSubsByUserTgId(tg_id));

	if (error) {
		res.status(400).json({ status: "error", msg: "Unable retrive the subscriptions" });
		return;
	}

	res.status(200).json({ status: "success", data, msg: "Subscription retrived successfully" });
}

export default { createNewSubscription, updateSubscriptionPlan, getSubsByPayer, getSubsByUserTgId };
