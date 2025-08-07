export enum RequestHeader {
	X_API_KEY = "x-api-key",
}

interface IApiSuccessResponse<T> {
	status: "success";
	msg: string;
	data?: T;
}
interface IApiErrorResponse {
	status: "error" | "failure" | "not-ready";
	msg: string;
}

export type IApiResponse<T = any> = IApiSuccessResponse<T> | IApiErrorResponse;

export const enum IApiEndpoint {
	CREATE_ACCOUNT = "accounts/create",
	GET_ACCOUNT_BY_WALLET = "accounts/get/by-wallet",
	CREATE_PLAN = "plans/create",
	GET_PLANS_BY_ACCOUNT = "plans/get/by-account",
	GET_PAYMENT_REQUIREMENTS = "payments/get/payment-reqs",
	MAKE_PAYMENT_FOR_PLAN = "payments/pay-plan",
	GET_INSTANT_PAYMENT_REQUIREMENTS = "payments/get/instant/payment-reqs",
	MAKE_INSTANT_PAYMENT = "payments/pay-instant",
	PAY_PREMIUM_DOCUMENT = "payments/pay-document",
	GET_PAYMENTS_BY_PAY_TO = "payments/get/by-pay-to",

	USDC_GET_TEST_TOKENS = "usdc-test/get/test-tokens",
	CREATE_SUBSCRIPTION = "subscriptions/create",

	UPLOAD_DOCUMENT = "documents/upload",
	GET_DOCUMENTS_BY_ACCOUNT = "documents/get/by-account"
}

export interface IMethodParams {
	endpoint: IApiEndpoint;
	queryParams?: Object;
	signal?: AbortSignal;
	data?: any;
	checkAuth?: boolean;
}

export const getEndpoint = (endpoint: IApiEndpoint) => `/${endpoint}`;
