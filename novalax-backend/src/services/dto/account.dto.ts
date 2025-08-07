import { IAccount } from "src/models/account.model";

export type ICreateAccount = Omit<IAccount, "createdAt" | "updatedAt" | "slug">;
