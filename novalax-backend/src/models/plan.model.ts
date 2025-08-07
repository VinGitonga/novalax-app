import mongoose, { model, Model, Schema } from "mongoose";
import { IAccount } from "./account.model";

export interface IPlan {
	title: string;
	description: string;
	tag?: string;
	text?: string;
	price: number;
	paymentPlan: string;
	features: string[];
	account: string | IAccount;
	uniqueId: string;
	createdAt: string;
	updatedAt: string;
}

type PlanModel = Model<IPlan>;

const planSchema = new Schema<IPlan, PlanModel>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		tag: { type: String },
		text: { type: String },
		price: { type: Number, required: true },
		paymentPlan: { type: String, required: true, enum: ["week", "month", "annual"] },
		features: { type: [String], default: [] },
		account: { type: mongoose.Types.ObjectId, ref: "Account" },
		uniqueId: { type: String, required: true },
	},
	{ timestamps: true }
);

export const Plan: PlanModel = model<IPlan, PlanModel>("Plan", planSchema);
