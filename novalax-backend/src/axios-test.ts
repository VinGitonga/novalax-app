import { privateKeyToAccount } from "viem/accounts";
import { API_BASE_URL, HEDERA_PRIVATE_KEY } from "./constants";
import { createWalletClient, http } from "viem";
import { hederaTestnet } from "viem/chains";
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";

const account = privateKeyToAccount(`0x${HEDERA_PRIVATE_KEY}`);
const walletClient = createWalletClient({ account, chain: hederaTestnet, transport: http() });
const axiosInstance = axios.create({ baseURL: API_BASE_URL });
const api = withPaymentInterceptor(axiosInstance as any, walletClient.account as any);

async function testRun() {
	try {
        const payResp = await api.get("/payments/pay-axios")

        console.log('payResp', payResp.data)
	} catch (error) {
        console.log('Errooro', error)
    }
}

testRun()

