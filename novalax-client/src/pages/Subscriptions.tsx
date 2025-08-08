import { DataTable } from "@/components/home/data-table";
import { SiteHeader } from "@/components/layouts/site-header";
import { CONTRACT_ADDRESS } from "@/constants";
import { recurringPaymentABI } from "@/contracts/abi";
import { useThirdwebStore } from "@/hooks/store/useThirdwebStore";
import { addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { defineChain, getContract, prepareContractCall, readContract, sendAndConfirmTransaction, waitForReceipt, type ThirdwebClient } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { etherlinkTestnet } from "viem/chains";
import data from "@/data/data.json";
import { useAccountStore } from "@/hooks/store/useAccountStore";
import type { Account } from "thirdweb/wallets";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { ethers } from "ethers";
import type { IOption } from "@/types/Option";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { getApprovalForTransaction } from "thirdweb/extensions/erc20";
import { extractErrorDetails } from "@/DecodeEvmTransactionLogsArgs";
import AppInput from "@/components/forms/AppInput";
import { WalletIcon } from "lucide-react";
import AppDatePicker from "@/components/forms/AppDatePicker";
import AppRadioGroup from "@/components/forms/AppRadioGroup";

const dateSchema = z.custom<CalendarDate>((val) => val instanceof CalendarDate, { message: "Invalid Date" });

const formObject = z.object({
	provider: z.string().refine((value) => ethers.isAddress(value), {
		message: "Provided address is invalid. Please ensure you have typed correctly.",
	}),
	amount: z.coerce.number<number>().positive("Amount must be greater than 0"),
	dueDate: dateSchema,
	payWith: z.string().min(1, "Please select Pay options"),
});

const payWithOptions = [
	{
		label: "USDT",
		value: "0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B",
	},
	{
		label: "USDC",
		value: "0xe3A01f57C76B6bdf926618C910E546F794ff6dd4",
	},
] satisfies IOption[];

const Subscriptions = () => {
	const activeAccount = useActiveAccount();

	const { client } = useThirdwebStore();
	const getUserPayments = async () => {
		const contract = getContract({
			abi: recurringPaymentABI,
			client: client!,
			chain: defineChain(etherlinkTestnet.id),
			address: CONTRACT_ADDRESS,
		});

		const resp = await readContract({ contract, method: "getUserPayments", params: [activeAccount?.address!, false] });

		console.log("resp", resp);
	};

	const { account } = useAccountStore();

	return (
		<>
			<SiteHeader title="Subscriptions" />
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-3">
						<div className="flex items-center justify-between">
							{account && !account.isProvider && <SchedulePaymentModal client={client!} account={activeAccount!} />}
							<Button onPress={getUserPayments}>Get Mine</Button>
						</div>
						<DataTable data={data} />
					</div>
				</div>
			</div>
		</>
	);
};

const SchedulePaymentModal = ({ client, account }: { client: ThirdwebClient; account: Account }) => {
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	const formMethods = useForm<z.infer<typeof formObject>>({
		resolver: zodResolver(formObject),
		defaultValues: {
			provider: "",
			dueDate: today(getLocalTimeZone()),
			amount: 1,
			payWith: "",
		},
	});

	const {
		handleSubmit,
		formState: { errors },
		control,
	} = formMethods;

	const onSubmit = handleSubmit(async (data) => {
		try {
			const contract = getContract({
				abi: recurringPaymentABI,
				client,
				chain: defineChain(etherlinkTestnet.id),
				address: CONTRACT_ADDRESS,
			});

			const dueDateUnix = Math.floor((Date.now() + 3 * 60 * 1000) / 1000);
			const amtInDecimals = ethers.parseUnits(String(data.amount), 6); // USDT has 6 decimals

			console.log("Submitting with:", { provider: data.provider, amount: amtInDecimals.toString(), dueDateUnix });

			// Prepare the schedulePayment transaction
			const preparedContractCall = prepareContractCall({
				contract,
				method: "schedulePayment",
				params: [data.provider, amtInDecimals, data.payWith, BigInt(dueDateUnix), false, BigInt(0)],
				erc20Value: {
					amountWei: amtInDecimals,
					tokenAddress: data.payWith,
				},
			});

			// Check if approval is needed for USDT
			const approvalTx = await getApprovalForTransaction({
				transaction: preparedContractCall as any,
				account,
			});

			if (approvalTx) {
				console.log("Approval needed, sending approval transaction...");
				const approvalReceipt = await sendAndConfirmTransaction({
					transaction: approvalTx,
					account,
				});
				console.log("Approval transaction receipt:", approvalReceipt);
			} else {
				console.log("No approval needed (already sufficient allowance).");
			}

			// Send the schedulePayment transaction
			const transaction = await sendAndConfirmTransaction({
				transaction: preparedContractCall,
				account,
			});

			const receipt = await waitForReceipt({
				client,
				chain: defineChain(etherlinkTestnet.id),
				transactionHash: transaction.transactionHash,
			});

			const onClickView = (hash: string) => {
				window.open(`https://testnet.explorer.etherlink.com/tx/${hash}`, "_blank");
			};

			addToast({
				title: "Payment scheduled successfully",
				color: "success",
				endContent: (
					<Button color="secondary" size="sm" variant="flat" onPress={() => onClickView(receipt.transactionHash)}>
						View Transaction
					</Button>
				),
			});

			onClose();
		} catch (err) {
			console.error("Error:", err);
			const errorParsed = extractErrorDetails(err, recurringPaymentABI);
			console.error("Parsed error:", errorParsed);
		}
	});

	return (
		<>
			<Button onPress={onOpen}>Schedule Payments</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent className="font-nunito">
					{(onClose) => (
						<FormProvider {...formMethods}>
							<form onSubmit={onSubmit}>
								<ModalHeader className="flex flex-col gap-1">Schedule Payments</ModalHeader>
								<ModalBody>
									<AppInput
										name="provider"
										control={control}
										error={errors.provider}
										label="Provider Address"
										placeholder="0x...8999"
										endContent={<WalletIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />}
										labelPlacement="inside"
									/>
									<AppInput name="amount" control={control} error={errors.amount} label="Amount" placeholder="10" labelPlacement="inside" type="number" />
									<AppDatePicker name="dueDate" control={control} error={errors.dueDate} label="Due Date" minDate={today(getLocalTimeZone())} />
									<AppRadioGroup label="Pay With" options={payWithOptions} name="payWith" control={control} error={errors.payWith} orientation="horizontal" />
								</ModalBody>
								<ModalFooter>
									<Button color="danger" variant="flat" type="button" onPress={onClose}>
										Close
									</Button>
									<Button color="primary" type="submit">
										Schedule
									</Button>
								</ModalFooter>
							</form>
						</FormProvider>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default Subscriptions;
