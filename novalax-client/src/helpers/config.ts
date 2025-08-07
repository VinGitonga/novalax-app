import { JsonRpcProvider } from "ethers";
import { HederaAdapter, HederaChainDefinition, hederaNamespace, HederaProvider } from "@hashgraph/hedera-wallet-connect";
import { type AppKitNetwork } from "@reown/appkit/networks";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
export const hederaRpcUrl = "https://testnet.hedera.api.hgraph.io/v1/pk_test/rpc";

export const jsonRpcProvider = new JsonRpcProvider(hederaRpcUrl);

if (!projectId) {
	throw new Error("Project ID is not defined");
}

export const metadata = {
	name: "Hedera EIP155 & HIP820 Example",
	description: "Hedera EIP155 & HIP820 Example",
	url: "https://github.com/hashgraph/hedera-wallet-connect/",
	icons: ["https://avatars.githubusercontent.com/u/31002956"],
};

export const networks = [
	// HederaChainDefinition.Native.Mainnet,
	// HederaChainDefinition.Native.Testnet,
	//should be same as import {hedera, hederaTestnet}from '@reown/appkit/networks'
	// HederaChainDefinition.EVM.Mainnet,
	HederaChainDefinition.EVM.Testnet,
] as [AppKitNetwork, ...AppKitNetwork[]];

export const nativeHederaAdapter = new HederaAdapter({
	projectId,
	networks: [HederaChainDefinition.Native.Testnet],
	namespace: hederaNamespace,
});

export const eip155HederaAdapter = new HederaAdapter({
	projectId,
	networks: [HederaChainDefinition.EVM.Testnet],
	namespace: "eip155",
});

export const ethersAdapter = new EthersAdapter();

export const wagmiAdapter = new WagmiAdapter({
	networks,
	projectId,
	ssr: true,
});

export const universalProvider = await HederaProvider.init({ projectId, metadata, logger: "debug" });
