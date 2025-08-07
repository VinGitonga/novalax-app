import { RouterProvider } from "react-router";
import router from "./router";
import { createAppKit } from "@reown/appkit/react";
import { eip155HederaAdapter, metadata, nativeHederaAdapter, networks, projectId, universalProvider, wagmiAdapter } from "./helpers/config";
import { hederaTestnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

createAppKit({
	adapters: [wagmiAdapter, nativeHederaAdapter, eip155HederaAdapter],
	universalProvider: universalProvider,
	defaultNetwork: hederaTestnet,
	projectId: projectId,
	metadata: metadata,
	networks: networks,
	themeMode: "light",
	enableReconnect: true,
	features: {
		analytics: true,
		socials: false,
		swaps: false,
		onramp: false,
		email: false,
	},
});

const App = () => {
	return (
		<WagmiProvider config={wagmiAdapter.wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</WagmiProvider>
	);
};

export default App;
