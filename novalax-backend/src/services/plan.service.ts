import { IPlan, Plan } from "src/models/plan.model";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";

type TCreatePlan = Omit<IPlan, "createdAt" | "updatedAt" | "uniqueId">;

async function createPlan(body: TCreatePlan) {
	const uniqueId = nanoid(8);

	const plan = new Plan({
		...body,
		uniqueId: uniqueId,
	});

	return await plan.save();
}

async function getPlansByAccount(account: string) {
	return await Plan.find({ account: new ObjectId(account) }).lean();
}

async function getPlanByUniqueId(uniqueId: string) {
	return await Plan.findOne({ uniqueId: uniqueId }).populate("account").lean();
}

export default { createPlan, getPlansByAccount, getPlanByUniqueId };
