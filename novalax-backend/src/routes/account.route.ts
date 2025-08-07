import { Router } from "express";
import { createAccountController, getAccountByWalletController } from "src/controllers/account.controller";

const accountRouter = Router();

accountRouter.post("/create", createAccountController);
accountRouter.get("/get/by-wallet/:wallet_address", getAccountByWalletController);

export default accountRouter;
