import { Account } from "src/models/account.model";
import { ICreateAccount } from "./dto/account.dto";

const generateSlug = (username: string): string => {
	return username
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
};

const generateUniqueSlug = async (username: string): Promise<string> => {
	let baseSlug = generateSlug(username);
	let slug = baseSlug;
	let counter = 1;

	while (true) {
		const existingAccount = await Account.findOne({ slug }).lean();
		if (!existingAccount) {
			break;
		}
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	return slug;
};

const createAccount = async (body: ICreateAccount) => {
	const accountExists = await Account.findOne({
		wallet_address: {
			$regex: `^${body.wallet_address}$`,
			$options: "i",
		},
	}).lean();

	if (accountExists) {
		throw new Error("Account already exists");
	}

	const slug = await generateUniqueSlug(body.username);

	const dataInfo = {
		...body,
		slug,
	};

	const account = new Account(dataInfo);

	return await account.save();
};

const getAccountByWallet = async (wallet_address: string) => {
	return await Account.findOne({
		wallet_address: {
			$regex: `^${wallet_address}$`,
			$options: "i",
		},
	}).lean();
};

const getAccountBySlug = async (slug: string) => {
	return await Account.findOne({ slug }).lean();
};

async function getAccountByTelegramUsername(tg_username: string) {
	return await Account.findOne({ tg_username: tg_username }).lean();
}

export default { createAccount, getAccountByWallet, getAccountBySlug, getAccountByTelegramUsername };
