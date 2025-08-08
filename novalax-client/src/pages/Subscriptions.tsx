import { DataTable } from "@/components/home/data-table";
import { SiteHeader } from "@/components/layouts/site-header";
import { CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/constants";
import { recurringPaymentABI } from "@/contracts/abi";
import { addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import data from "@/data/data.json";
import { useAccountStore } from "@/hooks/store/useAccountStore";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { ethers } from "ethers";
import type { IOption } from "@/types/Option";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import AppInput from "@/components/forms/AppInput";
import { WalletIcon } from "lucide-react";
import AppDatePicker from "@/components/forms/AppDatePicker";
import AppRadioGroup from "@/components/forms/AppRadioGroup";
import { useEffect, useState } from "react";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { wagmiAdapter } from "@/helpers/config";
import { usdcABI } from "@/contracts/usdc-abi";

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
	// {
	// 	label: "USDT",
	// 	value: "0xf7f007dc8Cb507e25e8b7dbDa600c07FdCF9A75B",
	// },
	{
		label: "USDC",
		value: "0xAc5b91246d0E22bb67A6b1e6Db5c05A7bB36d63d",
	},
] satisfies IOption[];

const Subscriptions = () => {
	const { account } = useAccountStore();

	return (
		<>
			<SiteHeader title="Subscriptions" />
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-3">
						<div className="flex items-center justify-between">
							{account && !account.isProvider && <SchedulePaymentModal />}
							<Button>Get Mine</Button>
						</div>
						<DataTable data={data} />
					</div>
				</div>
			</div>
		</>
	);
};

const SchedulePaymentModal = () => {
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
	const [paymentTx, setPaymentTx] = useState<string>("");

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

	useEffect(() => {
		async function onSuccessConfirmation() {
			const onClickView = (hash: string) => {
				window.open(`https://hashscan.io/testnet/transaction/${hash}`, "_blank");
			};

			addToast({
				title: "Payment scheduled successfully",
				color: "success",
				endContent: (
					<Button color="secondary" size="sm" variant="flat" onPress={() => onClickView(paymentTx!)}>
						View Transaction
					</Button>
				),
			});
		}
		if (paymentSuccess) {
			onSuccessConfirmation();
			onClose();
		}
	}, [paymentSuccess]);

	const onSubmit = handleSubmit(async (data) => {
		try {
			const dueDateUnix = Math.floor((Date.now() + 3 * 60 * 1000) / 1000);
			const amtInDecimals = ethers.parseUnits(String(data.amount), 6); // USDT has 6 decimals

			setIsProcessing(true);

			console.log("Submitting with:", { provider: data.provider, amount: amtInDecimals.toString(), dueDateUnix });

			// approve spending
			const result = await writeContract(wagmiAdapter.wagmiConfig, {
				abi: usdcABI,
				address: USDC_CONTRACT_ADDRESS,
				functionName: "approve",
				args: [CONTRACT_ADDRESS, amtInDecimals],
			});

			await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
				hash: result,
				confirmations: 1,
			});

			// now execute the transaction
			const result2 = await writeContract(wagmiAdapter.wagmiConfig, {
				address: CONTRACT_ADDRESS,
				abi: recurringPaymentABI,
				functionName: "schedulePayment",
				args: [data.provider as `0x${string}`, amtInDecimals, data.payWith as `0x${string}`, BigInt(dueDateUnix), false, BigInt(0)],
			});

			const { transactionHash } = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, { hash: result2 });
			setPaymentTx(transactionHash);
			setPaymentSuccess(true);
			setIsProcessing(false);
		} catch (err) {
			console.error("Error:", err);
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
									<Button color="primary" type="submit" isLoading={isProcessing} isDisabled={isProcessing}>
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
