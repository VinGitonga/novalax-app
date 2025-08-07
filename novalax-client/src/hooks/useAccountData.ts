import type { IAccount } from "@/types/Account";
import { useEffect, useState } from "react";
import { useApi } from "./useApi";
import { tryCatch } from "@/helpers/try-catch";
import { IApiEndpoint, type IApiResponse } from "@/types/Api";

const useAccountData = (wallet_address: string) => {
	const [accountData, setAccountData] = useState<IAccount | null>(null);

	const { get } = useApi();

	const fetchData = async () => {
		if (typeof wallet_address !== "string") {
			setAccountData(null);
			return;
		}

		const { data: resp, error } = await tryCatch(get<IApiResponse<IAccount>>({ endpoint: `${IApiEndpoint.GET_ACCOUNT_BY_WALLET}/${wallet_address}` as IApiEndpoint }));

		if (error) {
			console.log("Error getting data");
		}

		const rawResp = resp?.data;

		if (rawResp?.status === "success") {
			const data = rawResp.data;

			if (data) {
				setAccountData(data);
			}
		}
	};

	useEffect(() => {
		fetchData();
	}, [wallet_address]);

	return { data: accountData };
};

export default useAccountData;
