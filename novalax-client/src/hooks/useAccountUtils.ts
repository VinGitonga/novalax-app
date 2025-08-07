import { useCallback } from "react";
import { useApi } from "./useApi";
import type { IAccount } from "@/types/Account";
import { IApiEndpoint, type IApiResponse } from "@/types/Api";

type TCreateAccount = Omit<IAccount, "createdAt" | "updatedAt" | "_id" | "slug">;

const useAccountUtils = () => {
	const { post } = useApi();

	const createAccount = useCallback(
		async (data: TCreateAccount) => {
			const resp = await post<IApiResponse<IAccount>>({ endpoint: IApiEndpoint.CREATE_ACCOUNT, data });

			return resp.data;
		},
		[post]
	);

	return { createAccount };
};

export default useAccountUtils;
