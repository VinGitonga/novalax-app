import { Button } from "@heroui/react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
	link: string;
	isDisabled?: boolean
}
const AppIconCopyBtn = ({ link, isDisabled = false }: IProps) => {
	const [isCopied, setIsCopied] = useState(false);
	const handleCopy = () => {

		navigator.clipboard.writeText(link);
		setIsCopied(true);
		toast.success("Link copied to clipboard");

		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};
	return (
		<Button isDisabled={isDisabled} size="sm" color="secondary" isIconOnly variant="bordered" onPress={handleCopy}>
			{isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
		</Button>
	);
};

export default AppIconCopyBtn;
