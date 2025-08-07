import { useAccountStore } from "./store/useAccountStore";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import useAccountData from "./useAccountData";

const useLoadAccountData = () => {
	const activeWalletAccount = useAccount();

	const { data: accountInfo } = useAccountData(activeWalletAccount?.address!);

	const { setAccount } = useAccountStore();

	useEffect(() => {
		if (!activeWalletAccount) {
			return;
		}

		setAccount(accountInfo);
	}, [activeWalletAccount, accountInfo]);
};

export default useLoadAccountData;
