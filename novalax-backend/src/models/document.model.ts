import mongoose, { model, Model, Schema } from "mongoose";
import { IAccount } from "./account.model";

export interface IDocumentItem {
	name: string;
	size: number;
	type: string;
	cid: string;
	account: string | IAccount;
	price: number;
	uniqueId: string;
	createdAt: string;
	updatedAt: string;
}

type DocumentItemModel = Model<IDocumentItem>;

const documentItemSchema = new Schema<IDocumentItem, DocumentItemModel>(
	{
		name: { type: String, required: true },
		size: { type: Number, required: true },
		type: { type: String },
		cid: { type: String, required: true },
		account: { type: mongoose.Types.ObjectId, ref: "Account" },
		price: { type: Number, required: true, default: 0, min: 0 },
		uniqueId: { type: String, required: true },
	},
	{ timestamps: true }
);

export const DocumentItem: DocumentItemModel = model<IDocumentItem, DocumentItemModel>("DocumentItem", documentItemSchema);
