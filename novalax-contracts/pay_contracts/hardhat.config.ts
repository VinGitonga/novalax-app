import { vars, type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

if (!vars.has("DEPLOYER_PRIVATE_KEY")) {
	console.error("Missing env var DEPLOYER_PRIVATE_KEY");
}

const deployerPrivateKey = vars.get("DEPLOYER_PRIVATE_KEY");

const config: HardhatUserConfig = {
	solidity: "0.8.30",
	networks: {
		etherlinkMainnet: {
			url: "https://node.mainnet.etherlink.com",
			accounts: [deployerPrivateKey],
		},
		etherlinkTestnet: {
			url: "https://node.ghostnet.etherlink.com",
			accounts: [deployerPrivateKey],
		},
	},
	etherscan: {
		apiKey: {
			etherlinkMainnet: "DUMMY",
			etherlinkTestnet: "DUMMY",
		},
		customChains: [
			{
				network: "etherlinkMainnet",
				chainId: 42793,
				urls: {
					apiURL: "https://explorer.etherlink.com/api",
					browserURL: "https://explorer.etherlink.com",
				},
			},
			{
				network: "etherlinkTestnet",
				chainId: 128123,
				urls: {
					apiURL: "https://testnet.explorer.etherlink.com/api",
					browserURL: "https://testnet.explorer.etherlink.com",
				},
			},
		],
	},
};

export default config;
