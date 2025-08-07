import ActionButtonList from "@/components/ActionButtonList";
import { InfoList } from "@/components/InfoList";
import type { FunctionResult } from "@/types/HederaFns";
import { useState } from "react";

const HomeScreen = () => {
	const [transactionHash, setTransactionHash] = useState("");
	const [transactionId, setTransactionId] = useState("");
	const [signedMsg, setSignedMsg] = useState("");
	const [nodes, setNodes] = useState<string[]>([]);
	const [lastFunctionResult, setLastFunctionResult] = useState<FunctionResult | null>(null);

	const clearState = () => {
		setTransactionHash("");
		setTransactionId("");
		setSignedMsg("");
		setNodes([]);
		setLastFunctionResult(null);
	};

	return (
		<div>
			<h1>Hedera App Example using Reown AppKit and Hedera</h1>
			<ActionButtonList
				sendHash={setTransactionHash}
				ethTxHash={transactionHash}
				sendTxId={setTransactionId}
				sendSignMsg={setSignedMsg}
				sendNodeAddresses={setNodes}
				setLastFunctionResult={setLastFunctionResult}
				onDisconnect={clearState}
			/>
			<div className="mt-5"></div>
			<InfoList hash={transactionHash} txId={transactionId} signedMsg={signedMsg} nodes={nodes} lastFunctionResult={lastFunctionResult} />
		</div>
	);
};

export default HomeScreen;
