import { tryCatch } from "@/helpers/try-catch";
import { formatAmount } from "@/lib/utils";
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, Input, Switch } from "@heroui/react";
import { ArrowLeftIcon, CheckCircleIcon, CopyIcon, CreditCardIcon, DollarSignIcon, WalletIcon, XCircleIcon, ExternalLinkIcon, CalendarIcon, RepeatIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { createPublicClient, formatUnits, http, parseUnits, publicActions } from "viem";
import { getUSDCBalance } from "x402/shared/evm";
import { add, differenceInMilliseconds, getUnixTime, isDate, isFuture } from "date-fns";
import { recurringPaymentABI } from "@/contracts/abi";
import { CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/constants";
import useSubscriptionUtils, { type TCreateSubscription } from "@/hooks/useSubscriptionUtils";
import { hederaTestnet } from "viem/chains";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import ConnectBtn from "@/components/web3/ConnectBtn";
import GetUSDCTokensBtn from "@/components/GetUSDCTokensBtn";

const publicClient = createPublicClient({ chain: hederaTestnet, transport: http() }).extend(publicActions);

const RecurringPaymentCheckout = () => {
	const [searchParams] = useSearchParams();
	const activeAccount = useAccount();
	const navigate = useNavigate();

	// Get search params
	const targetWallet = searchParams.get("wallet") || "";
	const amount = searchParams.get("amount") || "";
	const dueDate = searchParams.get("dueDate") || "";
	const description = searchParams.get("description") || "Recurring Payment";
	const isRecurring = searchParams.get("recurring") === "true";
	const frequency = searchParams.get("frequency") || "monthly"; // weekly, monthly, yearly
	const tg_username = searchParams.get("u") || "";
	const tg_id = searchParams.get("tg_id") || "";

	const [usdcBalance, setUsdcBalance] = useState<string>("0");
	const [isValidParams, setIsValidParams] = useState<boolean>(true);
	const [autoApprove, setAutoApprove] = useState<boolean>(false);

	const { data: hash, writeContract, isPending: isTransactionPending, error } = useWriteContract();
	const { createSubscription } = useSubscriptionUtils();

	const copyPaymentLink = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Payment link copied to clipboard");
	};

	const checkUSDCBalance = useCallback(async () => {
		if (!activeAccount) return;

		const { data: balance, error } = await tryCatch(getUSDCBalance(publicClient as any, activeAccount.address as `0x${string}`));
		if (error) {
		}
		if (balance) {
			const formattedBalance = formatUnits(balance, 6);
			setUsdcBalance(formattedBalance);
		}
	}, [activeAccount, publicClient]);

	const computeInterval = (frequency: "weekly" | "monthly" | "yearly", currentDueDate: string) => {
		let nextDueDate = new Date(currentDueDate);

		if (frequency === "weekly") {
			nextDueDate = add(new Date(currentDueDate), {
				weeks: 1,
			});
		} else if (frequency === "monthly") {
			nextDueDate = add(new Date(currentDueDate), {
				months: 1,
			});
		} else if (frequency === "yearly") {
			nextDueDate = add(new Date(currentDueDate), {
				years: 1,
			});
		}

		const interval = differenceInMilliseconds(nextDueDate, new Date(currentDueDate));

		return { interval, nextDueDate };
	};

	const onPay = async () => {
		if (!targetWallet || !amount || !activeAccount) {
			toast.error("Please connect your wallet and ensure all parameters are valid");
			return;
		}

		const isDueDate_date = isDate(new Date(dueDate));
		if (!isDueDate_date) {
			toast.error("Due date has to be a date");
			return;
		}

		// check if dueDate is in the future
		const isDueDateInFuture = isFuture(new Date(dueDate));

		if (!isDueDateInFuture) {
			toast.error("Due date has to be in the future");
			return;
		}

		const dueDateUnix = getUnixTime(new Date(dueDate));
		const dueDateBigInt = BigInt(dueDateUnix);
		const amtInDecimals = parseUnits(amount, 6);

		const { interval } = computeInterval(frequency as any, dueDate);

		const computedInterval = BigInt(interval);

		writeContract({
			address: CONTRACT_ADDRESS,
			abi: recurringPaymentABI,
			functionName: "schedulePayment",
			args: [targetWallet as `0x${string}`, amtInDecimals, USDC_CONTRACT_ADDRESS, dueDateBigInt, true, computedInterval],
		});
	};

	// Validate search params on component mount
	useEffect(() => {
		if (!targetWallet || !amount || isNaN(parseFloat(amount))) {
			setIsValidParams(false);
		}
	}, [targetWallet, amount]);

	// Simulate USDC balance check
	useEffect(() => {
		if (activeAccount) {
			checkUSDCBalance();
		}
	}, [activeAccount]);

	const hasInsufficientBalance = parseFloat(usdcBalance) < parseFloat(amount);
	const isConnected = !!activeAccount;

	// Format due date for display
	const formatDueDate = (dateString: string) => {
		if (!dateString) return "Not specified";
		try {
			const date = new Date(dateString);
			const now = new Date();
			const isToday = date.toDateString() === now.toDateString();
			const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

			// Check if the date includes time (has hours/minutes)
			const hasTime = dateString.includes("T") || dateString.includes(" ") || dateString.includes(":");

			if (hasTime) {
				// Format with time
				const timeOptions: Intl.DateTimeFormatOptions = {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				};

				const dateOptions: Intl.DateTimeFormatOptions = {
					year: "numeric",
					month: "long",
					day: "numeric",
				};

				const timeString = date.toLocaleTimeString("en-US", timeOptions);
				const dateString = date.toLocaleDateString("en-US", dateOptions);

				if (isToday) {
					return `Today at ${timeString}`;
				} else if (isTomorrow) {
					return `Tomorrow at ${timeString}`;
				} else {
					return `${dateString} at ${timeString}`;
				}
			} else {
				// Format without time
				const dateOptions: Intl.DateTimeFormatOptions = {
					year: "numeric",
					month: "long",
					day: "numeric",
				};

				if (isToday) {
					return "Today";
				} else if (isTomorrow) {
					return "Tomorrow";
				} else {
					return date.toLocaleDateString("en-US", dateOptions);
				}
			}
		} catch {
			return dateString;
		}
	};

	// Get frequency display text
	const getFrequencyText = (freq: string) => {
		switch (freq) {
			case "weekly":
				return "Weekly";
			case "monthly":
				return "Monthly";
			case "yearly":
				return "Yearly";
			default:
				return "Monthly";
		}
	};

	const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: hash });

	useEffect(() => {
		async function saveRecurringPayment() {
			const { interval, nextDueDate } = computeInterval(frequency as any, dueDate);

			const dataToSave = {
				payer: activeAccount.address!,
				provider: targetWallet,
				amount: parseFloat(amount),
				token: USDC_CONTRACT_ADDRESS,
				dueDate: nextDueDate,
				isRecurring: true,
				interval: interval,
				tx: hash,
				tg_name: tg_username,
				tg_id: tg_id,
			} satisfies TCreateSubscription;

			const {} = await tryCatch(createSubscription(dataToSave));
		}
		if (isConfirmed) {
			saveRecurringPayment();
		}
	}, [isConfirmed]);

    console.log('Erroor----', error)

	if (!isValidParams) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
				<Card className="w-full max-w-md bg-transparent">
					<CardBody className="pt-6">
						<div className="text-center">
							<XCircleIcon className="h-12 w-12 text-danger mx-auto mb-4" />
							<h2 className="text-xl font-semibold mb-2">Invalid Payment Link</h2>
							<p className="text-muted-foreground mb-4">This payment link is missing required parameters (wallet address and amount).</p>
							<Button color="secondary" startContent={<ArrowLeftIcon className="h-4 w-4 mr-2" />} onPress={() => navigate("/")}>
								Go Home
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	if (isConfirmed) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
				<Card className="w-full max-w-md bg-transparent">
					<CardBody>
						<div className="text-center">
							<CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
							<h2 className="text-xl font-semibold mb-2">Recurring Payment Setup!</h2>
							<p className="text-muted-foreground mb-4">Your recurring payment has been configured successfully.</p>
							<div className="space-y-2 mb-6">
								<p className="text-sm text-muted-foreground">Amount: {formatAmount(amount)}</p>
								<p className="text-sm text-muted-foreground">
									To: {targetWallet.slice(0, 6)}...{targetWallet.slice(-4)}
								</p>
								{isRecurring && <p className="text-sm text-muted-foreground">Frequency: {getFrequencyText(frequency)}</p>}
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
						<Button color="secondary" variant="ghost" startContent={<ArrowLeftIcon className="h-4 w-4" />} onPress={() => navigate("/")}>
							Back
						</Button>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
								<RepeatIcon className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Recurring Payment</h1>
								<p className="text-muted-foreground">Set up automatic recurring USDC transfers</p>
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
								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
										<Input value={description} isReadOnly variant="bordered" placeholder="Payment description" className="w-full" />
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">Target Wallet Address</label>
										<div className="flex items-center space-x-2">
											<Input value={targetWallet} isReadOnly variant="bordered" placeholder="0x..." className="w-full font-mono text-sm" />
											<Button
												isIconOnly
												size="sm"
												variant="bordered"
												onPress={() => {
													navigator.clipboard.writeText(targetWallet);
													toast.success("Wallet address copied");
												}}>
												<CopyIcon className="h-4 w-4" />
											</Button>
											<Button isIconOnly size="sm" variant="bordered" onPress={() => window.open(`https://testnet.explorer.etherlink.com/address/${targetWallet}`, "_blank")}>
												<ExternalLinkIcon className="h-4 w-4" />
											</Button>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">Amount (USDC)</label>
										<Input value={amount} isReadOnly variant="bordered" placeholder="0.00" startContent={<DollarSignIcon className="h-4 w-4 text-muted-foreground" />} className="w-full" />
									</div>

									<div>
										<label className="text-sm font-medium text-muted-foreground mb-2 block">Due Date</label>
										<Input
											value={formatDueDate(dueDate)}
											isReadOnly
											variant="bordered"
											placeholder="Not specified"
											startContent={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
											className="w-full"
										/>
									</div>

									<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
										<div className="flex items-center space-x-3">
											<RepeatIcon className="h-5 w-5 text-purple-600" />
											<div>
												<label className="text-sm font-medium text-gray-900">Recurring Payment</label>
												<p className="text-xs text-muted-foreground">{isRecurring ? `${getFrequencyText(frequency)} payments` : "One-time payment"}</p>
											</div>
										</div>
										<Chip size="sm" color={isRecurring ? "secondary" : "default"} variant={isRecurring ? "solid" : "bordered"}>
											{isRecurring ? getFrequencyText(frequency) : "One-time"}
										</Chip>
									</div>
								</div>

								<Divider />

								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Amount:</span>
										<span className="font-semibold text-lg">{formatAmount(amount)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Currency:</span>
										<Chip size="sm" color="secondary">
											USDC
										</Chip>
									</div>
									{isRecurring && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Frequency:</span>
											<Chip size="sm" color="primary" variant="bordered">
												{getFrequencyText(frequency)}
											</Chip>
										</div>
									)}
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
													<span className="text-yellow-700">Insufficient USDC balance. You need {amount} USDC.</span>
												</div>
											</div>
										)}
										<GetUSDCTokensBtn />
									</div>
								</CardBody>
							</Card>
						)}

						{isConnected && isRecurring && (
							<Card className="bg-transparent">
								<CardHeader>
									<div className="space-y-2">
										<div className="flex items-center">
											<RepeatIcon className="w-5 h-5 mr-2" />
											Auto-Approval Settings
										</div>
										<p className="text-gray-600 text-sm">Configure automatic payment approval for future recurring payments</p>
									</div>
								</CardHeader>
								<CardBody>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div>
												<label className="text-sm font-medium text-gray-900">Auto-approve future payments</label>
												<p className="text-xs text-muted-foreground">Automatically approve recurring payments without manual confirmation</p>
											</div>
											<Switch isSelected={autoApprove} onValueChange={setAutoApprove} color="secondary" />
										</div>
										{autoApprove && (
											<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
												<div className="flex items-center">
													<CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
													<span className="text-blue-700 text-sm">
														Future {getFrequencyText(frequency).toLowerCase()} payments of {formatAmount(amount)} will be automatically processed.
													</span>
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
										<span className="text-muted-foreground">Payment Amount:</span>
										<span>{formatAmount(amount)}</span>
									</div>
									{isRecurring && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Frequency:</span>
											<span className="text-sm">{getFrequencyText(frequency)}</span>
										</div>
									)}
									<div className="flex justify-between">
										<span className="text-muted-foreground">Network Fee:</span>
										<span>~$0.01</span>
									</div>
									<Divider />
									<div className="flex justify-between font-semibold text-lg">
										<span>Total:</span>
										<span>{formatAmount(amount)}</span>
									</div>
								</div>

								<div className="space-y-3">
									<Button size="lg" color="secondary" onPress={onPay} isLoading={isTransactionPending || !isConnected || hasInsufficientBalance} isDisabled={isTransactionPending} className="w-full">
										{isTransactionPending ? "Processing..." : isRecurring ? `Setup ${getFrequencyText(frequency)} Payment` : `Pay ${formatAmount(amount)}`}
									</Button>
									{isConfirming && (
										<div className="text-xs text-muted-foreground text-center">
											<p>Transaction is being confirmed, please wait...</p>
										</div>
									)}

									<div className="text-xs text-muted-foreground text-center">
										<p>This payment will be sent to:</p>
										<p className="font-mono text-xs break-all mt-1">
											{targetWallet.slice(0, 10)}...{targetWallet.slice(-8)}
										</p>
										{isRecurring && <p className="mt-2 text-xs text-purple-600">Recurring {getFrequencyText(frequency).toLowerCase()} payments</p>}
									</div>
								</div>
							</CardBody>
							<CardFooter>
								<div className="text-xs text-muted-foreground text-center w-full">Powered by Novix Pay with x402 • Secure USDC payments</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecurringPaymentCheckout;
