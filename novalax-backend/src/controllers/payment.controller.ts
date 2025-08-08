import { Request, Response } from "express";
import { API_BASE_URL, FACILITATOR_URL } from "src/constants";
import { tryCatch } from "src/helpers/try-catch";
import { IAccount } from "src/models/account.model";
import accountService from "src/services/account.service";
import documentsService from "src/services/documents.service";
import paymentService from "src/services/payment.service";
import planService from "src/services/plan.service";
import { ExpressResponse } from "src/types/Api";
import { exact } from "x402/schemes";
import { findMatchingPaymentRequirements, getNetworkId, processPriceToAtomicAmount } from "x402/shared";
import { Network, PaymentPayload, PaymentRequirements, Price, Resource, settleResponseHeader } from "x402/types";
import { config } from "x402/types/shared/evm";
import { useFacilitator } from "x402/verify";

const x402Version = 1;
const { verify, settle } = useFacilitator({ url: FACILITATOR_URL });

async function getPaymentsByPayTo(req: Request, res: ExpressResponse) {
	const { data, error } = await tryCatch(paymentService.getPaymentsByPayTo(req.params.pay_to));

	if (error) {
		res.status(400).json({ status: "error", msg: error.message ?? "An error occured" });
	}

	res.status(200).json({ status: "success", data: data, msg: "Payments retrieved successfully" });
}

/**
 * Creates payment requirements for a given price and network
 *
 * @param price - The price to be paid for the resource
 * @param network - The blockchain network to use for payment
 * @param resource - The resource being accessed
 * @param description - Optional description of the payment
 * @returns An array of payment requirements
 */
function createExactPaymentRequirements(price: Price, network: Network, resource: Resource, payTo: string, description = ""): PaymentRequirements {
	const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
	if ("error" in atomicAmountForAsset) {
		throw new Error(atomicAmountForAsset.error);
	}

	const { maxAmountRequired, asset } = atomicAmountForAsset;

	// Fix the USDC name for Hedera testnet
	const usdcName = network === "hedera-testnet" ? "USD Coin" : asset.eip712.name;

	return {
		scheme: "exact",
		network,
		maxAmountRequired,
		resource,
		description,
		mimeType: "application/json",
		payTo: payTo,
		maxTimeoutSeconds: 300, // Match the frontend timeout
		asset: asset.address,
		outputSchema: undefined,
		extra: {
			name: usdcName,
			version: asset.eip712.version,
		},
	};
}

async function getPlanPaymentRequirements(req: Request, res: ExpressResponse) {
	const { plan, payToAccountSlug } = req.query;

	const account = await accountService.getAccountBySlug(payToAccountSlug as string);

	if (!account) {
		res.status(400).json({ status: "error", msg: "Provider not found" });
	}

	const planDetails = await planService.getPlanByUniqueId(plan as string);

	if (!planDetails) {
		res.status(400).json({ status: "error", msg: "Plan not found" });
	}

	const resource = `${API_BASE_URL}/payments/pay-plan?plan=${planDetails.uniqueId}` as Resource;

	const paymentReqs = [createExactPaymentRequirements(planDetails.price, "hedera-testnet", resource, account.wallet_address, `Pay for Plan : ${planDetails.title}`)];

	res.status(200).json({ status: "success", data: { paymentRequirements: paymentReqs, planDetails }, msg: "Plan payment requirements generated" });
}

/**
 * Verifies a payment and handles the response
 *
 * @param req - The Express request object
 * @param res - The Express response object
 * @param paymentRequirements - The payment requirements to verify against
 * @returns A promise that resolves to true if payment is valid, false otherwise
 */
async function verifyPayment(req: Request, res: Response, paymentRequirements: PaymentRequirements[]): Promise<boolean> {
	const payment = req.header("X-PAYMENT");
	if (!payment) {
		res.status(402).json({
			x402Version,
			error: "X-PAYMENT header is required",
			accepts: paymentRequirements,
		});
		return false;
	}

	console.log("🔍 Backend: Received payment header:", payment.substring(0, 100) + "...");

	let decodedPayment: PaymentPayload;
	try {
		decodedPayment = exact.evm.decodePayment(payment);
		decodedPayment.x402Version = x402Version;
		console.log("🔍 Backend: Decoded payment:", {
			from: decodedPayment.payload.authorization.from,
			to: decodedPayment.payload.authorization.to,
			value: decodedPayment.payload.authorization.value,
			validAfter: decodedPayment.payload.authorization.validAfter,
			validBefore: decodedPayment.payload.authorization.validBefore,
			nonce: decodedPayment.payload.authorization.nonce,
			signature: decodedPayment.payload.signature?.substring(0, 20) + "...",
		});
	} catch (error) {
		console.error("❌ Backend: Failed to decode payment:", error);
		res.status(402).json({
			x402Version,
			error: error || "Invalid or malformed payment header",
			accepts: paymentRequirements,
		});
		return false;
	}

	try {
		const selectedPaymentRequirement = findMatchingPaymentRequirements(paymentRequirements, decodedPayment) || paymentRequirements[0];
		console.log("🔍 Backend: Selected payment requirement:", {
			network: selectedPaymentRequirement.network,
			asset: selectedPaymentRequirement.asset,
			extra: selectedPaymentRequirement.extra,
		});

		// Debug the verification process
		const chainId = getNetworkId(selectedPaymentRequirement.network);
		const name = selectedPaymentRequirement.extra?.name ?? config[chainId.toString()].usdcName;
		console.log("🔍 Backend: Verification details:", {
			chainId,
			paymentRequirementsName: selectedPaymentRequirement.extra?.name,
			configName: config[chainId.toString()].usdcName,
			finalName: name,
		});

		const response = await verify(decodedPayment, selectedPaymentRequirement);
		console.log("🔍 Backend: Verification response:", response);

		if (!response.isValid) {
			res.status(402).json({
				x402Version,
				error: response.invalidReason,
				accepts: paymentRequirements,
				payer: response.payer,
			});
			return false;
		}
	} catch (error) {
		console.error("❌ Backend: Verification error:", error);
		res.status(402).json({
			x402Version,
			error,
			accepts: paymentRequirements,
		});
		return false;
	}

	return true;
}

async function makePlanPayments(req: Request, res: ExpressResponse) {
	const { plan } = req.query;

	const planDetails = await planService.getPlanByUniqueId(plan as string);

	if (!planDetails) {
		res.status(402).json({
			status: "error",
			msg: "Plan details not found",
			errors: {
				x402Version,
				error: "Plan details not found",
				accepts: {},
			},
		});
		return;
	}

	const price = planDetails.price;
	const resource = `${req.protocol}://${req.headers.host}${req.originalUrl}` as Resource;

	const paymentRequirements = [createExactPaymentRequirements(price, "hedera-testnet", resource, (planDetails.account as IAccount).wallet_address, `Pay for Plan : ${planDetails.title}`)];

	const isValid = await verifyPayment(req, res, paymentRequirements);

	if (!isValid) return;

	try {
		const settleResponse = await settle(exact.evm.decodePayment(req.header("X-PAYMENT")!), paymentRequirements[0]);

		const responseHeader = settleResponseHeader(settleResponse);

		// save the payment to database
		const dataToSave = {
			amount: planDetails.price,
			payer: settleResponse.payer,
			plan: String(planDetails._id),
			payTo: (planDetails.account as IAccount).wallet_address,
			transaction: settleResponse.transaction,
		};

		const { data: savedPayment, error } = await tryCatch(paymentService.createPaymentItem(dataToSave));

		res.setHeader("X-PAYMENT-RESPONSE", responseHeader);

		res.status(200).json({
			status: "success",
			data: {
				savedPayment,
			},
		});
	} catch (err) {
		console.log(err);
		res.status(402).json({
			status: "error",
			msg: "Unable to settle the payment at the moment, please try again.",
			errors: {
				x402Version,
				error: err,
				accepts: paymentRequirements,
			},
		});
	}
}

async function getInstantPaymentsRequirements(req: Request, res: ExpressResponse) {
	const { account, amt } = req.query;

	if (!account || !amt) {
		res.status(400).json({ status: "error", msg: `Amount and target address is required` });
		return;
	}

	if (parseFloat(amt as string) <= 0) {
		res.status(400).json({ status: "error", msg: `Amount must be greater than 0` });
		return;
	}

	const resource = `${API_BASE_URL}/payments/pay-instant?account=${account}&amt=${amt}` as Resource;

	const paymentReqs = [createExactPaymentRequirements(parseFloat(amt as string), "hedera-testnet", resource, account as string, `Instant payment`)];

	res.status(200).json({ status: "success", data: { paymentRequirements: paymentReqs } });
}

async function payInstantPayment(req: Request, res: ExpressResponse) {
	const { account, amt } = req.query;

	const amount = parseFloat(amt as string);

	const resource = `${req.protocol}://${req.headers.host}${req.originalUrl}` as Resource;

	const paymentRequirements = [createExactPaymentRequirements(amount, "hedera-testnet", resource, account as string, `Instant payment`)];

	const isValid = await verifyPayment(req, res, paymentRequirements);

	if (!isValid) return;

	try {
		const settleResponse = await settle(exact.evm.decodePayment(req.header("X-PAYMENT")!), paymentRequirements[0]);

		const responseHeader = settleResponseHeader(settleResponse);

		// save the payment to database
		const dataToSave = {
			amount: amount,
			payer: settleResponse.payer,
			payTo: account as string,
			transaction: settleResponse.transaction,
		};

		const { data: savedPayment, error } = await tryCatch(paymentService.createPaymentItem(dataToSave));

		res.setHeader("X-PAYMENT-RESPONSE", responseHeader);

		res.status(200).json({
			status: "success",
			data: {
				savedPayment,
			},
		});
	} catch (err) {
		console.log(err);
		res.status(402).json({
			status: "error",
			msg: "Unable to settle the payment at the moment, please try again.",
			errors: {
				x402Version,
				error: err,
				accepts: paymentRequirements,
			},
		});
	}
}

async function payPremiumDocument(req: Request, res: ExpressResponse) {
	const { docId } = req.query;

	const documentItem = await documentsService.getDocumentByUniqueId(docId as string);

	if (!documentItem) {
		res.status(402).json({
			status: "error",
			msg: "Document not found",
			errors: {
				x402Version,
				error: "Missing document",
				accepts: {},
			},
		});
		return;
	}

	const price = documentItem.price;

	const resource = `${req.protocol}://${req.headers.host}${req.originalUrl}` as Resource;

	const paymentRequirements = [createExactPaymentRequirements(price, "hedera-testnet", resource, (documentItem.account as IAccount).wallet_address, `Pay for Plan : ${documentItem.name}`)];

	const isValid = await verifyPayment(req, res, paymentRequirements);

	if (!isValid) return;

	try {
		const settleResponse = await settle(exact.evm.decodePayment(req.header("X-PAYMENT")!), paymentRequirements[0]);

		const responseHeader = settleResponseHeader(settleResponse);

		// save the payment to database
		const dataToSave = {
			amount: documentItem.price,
			payer: settleResponse.payer,
			payTo: (documentItem.account as IAccount).wallet_address,
			transaction: settleResponse.transaction,
		};

		const { data: savedPayment, error } = await tryCatch(paymentService.createPaymentItem(dataToSave));

		res.setHeader("X-PAYMENT-RESPONSE", responseHeader);

		res.status(200).json({
			status: "success",
			data: {
				savedPayment,
			},
		});
	} catch (err) {
		console.log(err);
		res.status(402).json({
			status: "error",
			msg: "Unable to settle the payment at the moment, please try again.",
			errors: {
				x402Version,
				error: err,
				accepts: paymentRequirements,
			},
		});
	}
}

async function axiosTestRun(req: Request, res: ExpressResponse) {
	const resource = `${req.protocol}://${req.headers.host}${req.originalUrl}` as Resource;

	const price = 10;

	const paymentRequirements = [createExactPaymentRequirements(price, "hedera-testnet", resource, "0x68EcA16c451C55fC4613a2f982090b65234C8D8a", `Pay for item`)];

	const isValid = await verifyPayment(req, res, paymentRequirements);

	if (!isValid) return;
	try {
		const settleResponse = await settle(exact.evm.decodePayment(req.header("X-PAYMENT")!), paymentRequirements[0]);

		const responseHeader = settleResponseHeader(settleResponse);

		res.setHeader("X-PAYMENT-RESPONSE", responseHeader);

		res.status(200).json({
			status: "success",
			data: {},
		});
	} catch (err) {
		console.log(err);
		res.status(402).json({
			status: "error",
			msg: "Unable to settle the payment at the moment, please try again.",
			errors: {
				x402Version,
				error: err,
				accepts: paymentRequirements,
			},
		});
	}
}

export default { getPaymentsByPayTo, getPlanPaymentRequirements, makePlanPayments, getInstantPaymentsRequirements, payInstantPayment, payPremiumDocument, axiosTestRun };
