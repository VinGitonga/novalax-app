import ConnectBtn from "@/components/web3/ConnectBtn";
import { API_BASE_URL } from "@/constants";
import { tryCatch } from "@/helpers/try-catch";
import usePaymentsUtils from "@/hooks/usePaymentsUtils";
import { formatAmount } from "@/lib/utils";
import type { IAccount } from "@/types/Account";
import { IApiEndpoint } from "@/types/Api";
import type { IPlan } from "@/types/Plan";
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@heroui/react";
import { ArrowLeftIcon, CheckCircleIcon, CopyIcon, CreditCardIcon, DollarSignIcon, Loader2Icon, WalletIcon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { createPublicClient, formatUnits, http, publicActions } from "viem";
import { hederaTestnet } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { selectPaymentRequirements } from "x402";
import { ensureValidAmount } from "x402/paywall/src/utils";
import { exact } from "x402/schemes";
import { getUSDCBalance } from "x402/shared/evm";
import type { PaymentRequirements } from "x402/types";

const publicClient = createPublicClient({ chain: hederaTestnet, transport: http() }).extend(publicActions);

const PaymentCheckout = () => {
	const { businessId, planId } = useParams<{ businessId: string; planId: string }>();
	const activeAccount = useAccount();
	const { getPaymentRequirements } = usePaymentsUtils();
	const { data: wagmiWalletClient } = useWalletClient();

	const [paymentRequirements, setPaymentRequirements] = useState<PaymentRequirements[]>([]);
	const [paymentDetailsError, setPaymentDetailsError] = useState<string | null>(null);
	const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
	const [planDetails, setPlanDetails] = useState<IPlan>();
	const [usdcBalance, setUsdcBalance] = useState<string>("0");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

	const navigate = useNavigate();

	const copyPaymentLink = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Payment link copied to clipboard");
	};

	const checkUSDCBalance = useCallback(async () => {
		if (!activeAccount || !businessId || !planId) return;

		const { data: balance, error } = await tryCatch(getUSDCBalance(publicClient as any, activeAccount.address as `0x${string}`));
		if (error) {
		}
		if (balance) {
			const formattedBalance = formatUnits(balance, 6);
			setUsdcBalance(formattedBalance);
		}
	}, [activeAccount, businessId, planId, publicClient]);

	const handlePayment = async () => {
		if (!businessId || !planId || !activeAccount || !wagmiWalletClient) {
			toast.error("Please connect your wallet first");
			return;
		}

		setIsProcessing(true);

		const walletClient = wagmiWalletClient?.extend(publicActions);
		const payReqs = selectPaymentRequirements(paymentRequirements.flat(), "etherlink-testnet", "exact");
		const validPaymentRequirements = ensureValidAmount(payReqs);
		const paymentPayload = await exact.evm.createPayment(walletClient as any, 1, validPaymentRequirements);

		const payment: string = exact.evm.encodePayment(paymentPayload);

		const response = await fetch(`${API_BASE_URL}/api/${IApiEndpoint.MAKE_PAYMENT_FOR_PLAN}?plan=${planId}`, {
			headers: { "X-PAYMENT": payment, "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE" },
			method: "GET",
		});

		setIsProcessing(false);

		if (!response.ok) {
			toast.error("Payment failed to settle");
			return;
		}

		setPaymentSuccess(true);
		toast.success("Payment successful");
	};

	useEffect(() => {
		if (activeAccount) {
			checkUSDCBalance();
		}
	}, [activeAccount]);

	useEffect(() => {
		async function getPaymentDetails() {
			setLoadingDetails(true);
			const { data: resp, error } = await tryCatch(getPaymentRequirements(planId!, businessId!));
			setLoadingDetails(false);
			if (error) {
				setPaymentDetailsError("Invalid link");
			}

			if (resp?.status === "success") {
				setPaymentRequirements(resp.data?.paymentRequirements!);
				setPlanDetails(resp.data?.planDetails!);
			}
		}

		if (businessId && planId) {
			getPaymentDetails();
		}
	}, [businessId, planId]);

	const hasInsufficientBalance = parseFloat(usdcBalance) < parseFloat(String(planDetails?.price! || "0"));

	const isConnected = !!activeAccount;

	if (loadingDetails) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<Loader2Icon className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
					<p className="text-muted-foreground">Loading payment link...</p>
				</div>
			</div>
		);
	}

	if (paymentDetailsError || !businessId || !planId) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<Card className="w-full max-w-md bg-transparent">
					<CardBody className="pt-6">
						<div className="text-center">
							<XCircleIcon className="h-12 w-12 text-danger mx-auto mb-4" />
							<h2 className="text-xl font-semibold mb-2">Payment Link Not Found</h2>
							<p className="text-muted-foreground mb-4">{"This payment link doesn't exist or has been removed."}</p>
							<Button color="secondary" startContent={<ArrowLeftIcon className="h-4 w-4 mr-2" />} onPress={() => navigate("/")}>
								Go Home
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	if (paymentSuccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
				<Card className="w-full max-w-md bg-transparent">
					<CardBody>
						<div className="text-center">
							<CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
							<p className="text-muted-foreground mb-4">Thank you for your payment. You will receive your product shortly.</p>
							<div className="space-y-2 mb-6">
								<p className="text-sm text-muted-foreground">Amount: {formatAmount(String(planDetails?.price))}</p>
								<p className="text-sm text-muted-foreground">Business: {(planDetails?.account as IAccount)?.username}</p>
							</div>
							<Button onPress={() => navigate("/")}>
								<ArrowLeftIcon className="h-4 w-4 mr-2" />
								Return Home
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<div className="mb-4">
						<Button color="secondary" variant="ghost" startContent={<ArrowLeftIcon className="h-4 w-4" />}>
							Back
						</Button>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<img src={"/images/business-logo.jpg"} className="w-12 h-12 rounded-lg" />
							<div>
								<h1 className="text-2xl font-bold text-gray-900">{(planDetails?.account as IAccount)?.username}</h1>
								<p className="text-muted-foreground">Secure Payment</p>
							</div>
						</div>
						<Button color="secondary" variant="bordered" size="sm" onPress={copyPaymentLink}>
							<CopyIcon className="h-4 w-4 mr-2" />
							Copy Link
						</Button>
					</div>
				</div>
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
					<div className="xl:col-span-2 space-y-6">
						<Card className="bg-transparent">
							<CardHeader className="gap-2">
								<CreditCardIcon className="h-5 w-5" />
								<h2>Payment Details</h2>
							</CardHeader>
							<CardBody className="space-y-4">
								<div className="flex items-center space-x-4">
									<div className="">
										<h3 className="font-semibold">{planDetails?.title}</h3>
										<p className="text-sm text-gray-600">{planDetails?.description}</p>
									</div>
								</div>
								<Divider />
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Amount:</span>
										<span className="font-semibold text-lg">{formatAmount(String(planDetails?.price))}</span>
									</div>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Currency:</span>
									<Chip size="sm" color="secondary">
										USDC
									</Chip>
								</div>
							</CardBody>
						</Card>
						{!isConnected ? (
							<Card className="bg-transparent">
								<CardHeader>
									<div className="space-y-2">
										<div className="flex items-center">
											<WalletIcon className="w-5 h-5 mr-2" />
											Connect Wallet
										</div>
										<p className="text-gray-600 text-sm">Connect your wallet to proceed with your payment</p>
									</div>
								</CardHeader>
								<CardBody>
									<div className="flex justify-center">
										<ConnectBtn />
									</div>
								</CardBody>
							</Card>
						) : (
							<Card className="bg-transparent">
								<CardHeader>
									<div className="flex items-center">
										<DollarSignIcon className="w-5 h-5 mr-2" />
										USDC Balance
									</div>
								</CardHeader>
								<CardBody>
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<span className="text-muted-foreground">Your Balance:</span>
											<span className="font-semibold">{usdcBalance} USDC</span>
										</div>
										{hasInsufficientBalance && (
											<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
												<div className="flex items-center">
													<XCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
													<span className="text-yellow-700">Insufficient USDC balance. You need {planDetails?.price} USDC.</span>
												</div>
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						)}
					</div>
					<div className="xl:col-span-1">
						<Card className="bg-transparent sticky top-0">
							<CardHeader>Payment Summary</CardHeader>
							<CardBody className="space-y-4">
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Subtotal:</span>
										<span>{formatAmount(String(planDetails?.price))}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Network Fee:</span>
										<span>~$0.01</span>
									</div>
									<Divider />
									<div className="flex justify-between font-semibold text-lg">
										<span>Total:</span>
										<span>{formatAmount(String(planDetails?.price))}</span>
									</div>
								</div>
								<Button size="lg" color="secondary" onPress={handlePayment} isLoading={isProcessing || !isConnected || hasInsufficientBalance} isDisabled={isProcessing}>
									Pay {formatAmount(String(planDetails?.price))}
								</Button>
							</CardBody>
							<CardFooter>
								<div className="text-xs text-muted-foreground text-center">Powered by Novalax with x402 • Secure USDC payments</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PaymentCheckout;
