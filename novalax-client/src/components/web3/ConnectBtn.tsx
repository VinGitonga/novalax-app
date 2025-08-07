import { Button } from "@heroui/react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";

interface ConnectBtnProps {
	onDisconnect?: VoidFunction;
}

const ConnectBtn = ({ onDisconnect }: ConnectBtnProps) => {
	const { disconnect } = useDisconnect();
	const { isConnected } = useAppKitAccount();

	const handleDisconnect = async () => {
		try {
			await disconnect();
			// Call the onDisconnect callback to clear UI state
			if (onDisconnect) {
				onDisconnect();
			}
		} catch (error) {
			console.error("Failed to disconnect:", error);
		}
	};

	return (
		<div className="text-white!">
			<div className="appkit-buttons flex items-center gap-2">
				<appkit-button />
				{isConnected && (
					<>
						<appkit-network-button />
						<Button color="secondary" onPress={handleDisconnect}>Disconnect</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default ConnectBtn;
