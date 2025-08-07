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
		<div>
			<div className="appkit-buttons">
				<appkit-button />
				{isConnected && (
					<>
						<appkit-network-button />
						<Button color="secondary" onPress={handleDisconnect}></Button>
					</>
				)}
			</div>
		</div>
	);
};

export default ConnectBtn;
