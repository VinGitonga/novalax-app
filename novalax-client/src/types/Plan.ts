import type { IAccount } from "./Account";

export interface IPlan {
	_id: string;
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
