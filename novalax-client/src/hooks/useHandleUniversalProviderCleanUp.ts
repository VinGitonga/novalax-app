import { universalProvider } from "@/helpers/config";
import { useDisconnect } from "@reown/appkit/react";
import { useEffect } from "react";

const useHandleUniversalProviderCleanUp = () => {
	const { disconnect } = useDisconnect();

	useEffect(() => {
		const handleDisconnect = () => {
			if (universalProvider.session?.namespaces?.eip155) {
				disconnect().catch((err) => console.log(`Failed to auto disconnect:`, err));
			}
		};

		universalProvider.on("session_delete", handleDisconnect);
		universalProvider.client.core?.pairing?.events?.on("pairing_delete", handleDisconnect);

		return () => {
			universalProvider.off("session_delete", handleDisconnect);
			universalProvider.client.core?.pairing?.events?.off("pairing_delete", handleDisconnect);
		};
	}, [disconnect]);
};

export default useHandleUniversalProviderCleanUp;
