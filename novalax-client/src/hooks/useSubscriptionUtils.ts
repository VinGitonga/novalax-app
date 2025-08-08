import { useCallback } from "react";
import { useApi } from "./useApi";
import type { ISubscription } from "@/types/Subscription";
import { IApiEndpoint, type IApiResponse } from "@/types/Api";

export type TCreateSubscription = Omit<ISubscription, "createdAt" | "updatedAt" | "_id" | "active" | "executed">;

const useSubscriptionUtils = () => {
	const { post } = useApi();

	const createSubscription = useCallback(
		async (data: TCreateSubscription) => {
			const resp = await post<IApiResponse<ISubscription>>({ endpoint: IApiEndpoint.CREATE_SUBSCRIPTION, data });

			return resp.data;
		},
		[post]
	);

	return { createSubscription };
};

export default useSubscriptionUtils;
