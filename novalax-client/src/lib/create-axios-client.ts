import { RequestHeader } from "@/types/Api";
import axios, { type AxiosRequestConfig } from "axios";

interface CreateAxiosClientOptions {
	options?: AxiosRequestConfig;
	getAuthToken: () => Promise<string> | null;
}

export function createAxiosClient({ options = {}, getAuthToken }: CreateAxiosClientOptions) {
	const client = axios.create(options);

	// create a request interceptor to add backend auth token to request header
	client.interceptors.request.use(
		async (config) => {
			// ensure auth token header is not already set
			if (config.headers[RequestHeader.X_API_KEY] !== false) {
				const authToken = await getAuthToken();
				if (authToken) {
					config.headers[RequestHeader.X_API_KEY] = `${authToken}`;
				}
			}

			return config;
		},
		(error) => {
			console.log("createAxiosClient:error", error);
			return Promise.reject(error);
		}
	);

	return client;
}