import { tryCatch } from "@/helpers/try-catch";
import usePaymentsUtils from "@/hooks/usePaymentsUtils";
import { Button } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

const GetUSDCTokensBtn = () => {
	const activeAccount = useAccount();
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const { getUSDCTestTokens } = usePaymentsUtils();

	const onPressGetTokens = async () => {
		if (!activeAccount) {
			toast.error("Please connect your wallet");
			return;
		}

		setIsProcessing(true);
		const { data: _, error } = await tryCatch(getUSDCTestTokens(activeAccount.address!));
		setIsProcessing(false);

		if (error) {
			toast.error("Unable to get test USDC tokens at the moment, try again later.");
			return;
		}

		toast.success("Your wallet has been funded with USDC tokens");
	};

	return (
		<Button onPress={onPressGetTokens} color="secondary" isDisabled={!activeAccount || isProcessing} isLoading={isProcessing}>
			Get USDC Test Tokens
		</Button>
	);
};

export default GetUSDCTokensBtn;
