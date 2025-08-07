import { Response } from "express";

interface IApiSuccessResponse<T> {
	status: "success";
	msg?: string;
	data?: T;
}
interface IApiErrorResponse {
	status: "error" | "failure" | "not-ready";
	msg?: string;
	errors?: any
}

export type IApiResponse<T = any> = IApiSuccessResponse<T> | IApiErrorResponse;

export type ExpressResponse<T = any> = Response<IApiResponse<T>>;
