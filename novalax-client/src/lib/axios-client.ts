import { API_URL } from "@/constants";
import { createAxiosClient } from "./create-axios-client";

const axiosClient = createAxiosClient({
	options: {
		baseURL: API_URL,
		timeout: 60000,
		headers: {
			"Content-Type": "application/json",
		},
	},
	getAuthToken: async () => {
		return Promise.resolve("");
	},
});

export default axiosClient;
