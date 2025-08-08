import { useCallback } from "react";
import { useApi } from "./useApi";
import type { IPlan } from "@/types/Plan";
import { IApiEndpoint, type IApiResponse } from "@/types/Api";

type TCreatePlan = Omit<IPlan, "createdAt" | "updatedAt" | "_id" | "uniqueId">;

const usePlanUtils = () => {
	const { post } = useApi();

	const createPlan = useCallback(
		async (data: TCreatePlan) => {
			const resp = await post<IApiResponse<IPlan>>({ endpoint: IApiEndpoint.CREATE_PLAN, data });

			return resp.data;
		},
		[post]
	);

	return { createPlan };
};

export default usePlanUtils;
