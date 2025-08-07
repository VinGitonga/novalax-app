import { Request } from "express";
import { tryCatch } from "src/helpers/try-catch";
import accountService from "src/services/account.service";
import { ExpressResponse } from "src/types/Api";

export const createAccountController = async (req: Request, res: ExpressResponse) => {
	const { data, error } = await tryCatch(accountService.createAccount(req.body));

	if (error) {
		res.status(400).json({ status: "error", msg: error.message ?? "An error occured" });
	}

	res.status(200).json({ status: "success", data, msg: "Account created successfully" });
};

export const getAccountByWalletController = async (req: Request, res: ExpressResponse) => {
	const { data, error } = await tryCatch(accountService.getAccountByWallet(req.params.wallet_address as string));

	if (error) {
		res.status(400).json({ status: "error", msg: "Unable to fetch the account" });
	}

	res.status(200).json({ status: "success", data: data, msg: "Account fetched successfully" });
};
