import { Request } from "express";
import { tryCatch } from "src/helpers/try-catch";
import planService from "src/services/plan.service";
import { ExpressResponse } from "src/types/Api";

async function createPlan(req: Request, res: ExpressResponse) {
	const { data, error } = await tryCatch(planService.createPlan(req.body));

	if (error) {
		res.status(400).json({ status: "error", msg: error.message ?? "An error occured" });
	}

	res.status(200).json({ status: "success", data: data, msg: "Plan created successfully" });
}

async function getPlansByAccount(req: Request, res: ExpressResponse) {
	const { data, error } = await tryCatch(planService.getPlansByAccount(req.params.account));

	if (error) {
		res.status(400).json({ status: "error", msg: error.message ?? "An error occured" });
	}

	res.status(200).json({ status: "success", data: data, msg: "Plan created successfully" });
}

export default { createPlan, getPlansByAccount };
