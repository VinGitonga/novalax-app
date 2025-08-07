import { useCallback } from "react";
import { useApi } from "./useApi";
import { IApiEndpoint, type IApiResponse } from "@/types/Api";
import type { PaymentRequirements } from "x402/types";
import type { IPlan } from "@/types/Plan";

const usePaymentsUtils = () => {
	const { get } = useApi();

	const getPaymentRequirements = useCallback(
		async (plan: string, payToAccountSlug: string) => {
			const resp = await get<IApiResponse<{ paymentRequirements: PaymentRequirements[]; planDetails: IPlan }>>({ endpoint: IApiEndpoint.GET_PAYMENT_REQUIREMENTS, queryParams: { plan, payToAccountSlug } });

			return resp.data;
		},
		[get]
	);

	const getInstantPaymentRequirements = useCallback(
		async (account: string, amt: string) => {
			const resp = await get<IApiResponse<{ paymentRequirements: PaymentRequirements[] }>>({ endpoint: IApiEndpoint.GET_INSTANT_PAYMENT_REQUIREMENTS, queryParams: { account, amt } });

			return resp.data;
		},
		[get]
	);

	const getUSDCTestTokens = useCallback(
		async (wallet_address: string) => {
			const resp = await get<IApiResponse<object>>({ endpoint: `${IApiEndpoint.USDC_GET_TEST_TOKENS}/${wallet_address}` as IApiEndpoint });

			return resp.data;
		},
		[get]
	);

	return { getPaymentRequirements, getInstantPaymentRequirements, getUSDCTestTokens };
};

export default usePaymentsUtils;
