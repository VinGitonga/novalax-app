import { ISubscription, Subscription } from "src/models/subscription.model";

type TCreateSubscription = Omit<ISubscription, "createdAt" | "updatedAt">;

async function createNewSubscription(body: TCreateSubscription) {
	const newSub = new Subscription(body);

	return await newSub.save();
}

async function updateSubscriptionPlan(body: Partial<TCreateSubscription>, subId: string) {
	const sub = await Subscription.findById(subId);

	if (!sub) {
		throw new Error("No subscription found with that id found");
	}

	return await Subscription.findByIdAndUpdate(sub, { $set: { ...body } }, { new: true });
}

async function getActiveSubscriptionsDue() {
	const now = new Date();

	const subs = await Subscription.find({ dueDate: { $lte: now }, active: true, executed: false });

	return subs;
}

async function getSubsByPayer(payer: string) {
	return await Subscription.find({
		payer: {
			$regex: `^${payer}$`,
			$options: "i",
		},
	}).lean();
}

async function getSubsByUserTgId(tg_id: string) {
	try {
		return await Subscription.find({
			tg_id: tg_id,
		}).lean();
	} catch (error) {
		console.log("Error", error);
		return [];
	}
}

export default { createNewSubscription, updateSubscriptionPlan, getActiveSubscriptionsDue, getSubsByPayer, getSubsByUserTgId };
