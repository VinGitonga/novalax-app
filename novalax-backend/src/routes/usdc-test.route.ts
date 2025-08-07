import { Router } from "express";
import { USDC_CONTRACT_ADDRESS, WALLET_PRIVATE_KEY } from "src/constants";
import { usdcABI } from "src/contracts/usdc-abi";
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "viem/chains";

const usdcRouter = Router();

const publicClient = createPublicClient({ chain: hederaTestnet, transport: http() });
const account = privateKeyToAccount(`0x${WALLET_PRIVATE_KEY}`);
const walletClient = createWalletClient({ account, chain: hederaTestnet, transport: http() });

// Helper function to convert BigInt values to strings for JSON serialization
function convertBigIntToString(obj: any): any {
	if (obj === null || obj === undefined) {
		return obj;
	}
	
	if (typeof obj === 'bigint') {
		return obj.toString();
	}
	
	if (Array.isArray(obj)) {
		return obj.map(convertBigIntToString);
	}
	
	if (typeof obj === 'object') {
		const converted: any = {};
		for (const [key, value] of Object.entries(obj)) {
			converted[key] = convertBigIntToString(value);
		}
		return converted;
	}
	
	return obj;
}

usdcRouter.get("/get/test-tokens/:wallet_address", async (req, res) => {
	const wallet_address = req.params.wallet_address;

	const amount = 100; // in usdc
	const amtInDecimals = parseUnits(String(amount), 6);

	try {
		const tx = await walletClient.writeContract({
			address: USDC_CONTRACT_ADDRESS,
			abi: usdcABI,
			functionName: "mint",
			args: [wallet_address, amtInDecimals],
			account,
			chain: hederaTestnet,
		});

		const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

		// Convert BigInt values to strings for JSON serialization
		const serializableReceipt = convertBigIntToString(receipt);

		res.status(200).json({ status: "success", msg: "100 USDC Test tokens minted", data: serializableReceipt });
	} catch (err) {
		console.log("Erororor", err);
		res.status(500).json({
			status: "error",
			msg: "An error occured",
		});
	}
});

export default usdcRouter;
