import type { IPlan } from "./Plan";
import type { ISubscription } from "./Subscription";

export interface IPayment {
	_id: string;
	amount: number;
	payer: string;
	plan?: string | IPlan;
	createdAt: string;
	updatedAt: string;
	transaction: string;
	payTo: string;
	subscription?: string | ISubscription;
}
