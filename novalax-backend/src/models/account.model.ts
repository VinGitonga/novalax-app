import { model, Model, Schema } from "mongoose";

export interface IAccount {
	username: string;
	isProvider: boolean;
	tg_username?: string;
	wallet_address: string;
	createdAt: string;
	updatedAt: string;
	slug: string;
	chat_id?: string;
}

type AccountModel = Model<IAccount>;

const accountSchema = new Schema<IAccount, AccountModel>(
	{
		username: { type: String, required: true },
		isProvider: { type: Boolean, default: false },
		tg_username: { type: String },
		wallet_address: { type: String },
		slug: { type: String, required: true },
		chat_id: { type: String },
	},
	{ timestamps: true }
);

export const Account: AccountModel = model<IAccount, AccountModel>("Account", accountSchema);
