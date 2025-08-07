import type { IAccount } from "@/types/Account";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IAccountStore {
	account: IAccount | null;
	setAccount: (val: IAccount | null) => void;
}

export const useAccountStore = create(
	persist<IAccountStore>(
		(set) => ({
			account: null,
			setAccount: (val) => {
				set({ account: val });
			},
		}),
		{ name: "novix_pay_store", storage: createJSONStorage(() => localStorage) }
	)
);
