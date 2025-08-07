import useHandleUniversalProviderCleanUp from "@/hooks/useHandleUniversalProviderCleanUp";
import type { FC, ReactNode } from "react";

interface AppServicesProps {
	children?: ReactNode;
}

const AppServices: FC<AppServicesProps> = ({ children }) => {
	useHandleUniversalProviderCleanUp();
	return <>{children}</>;
};

export default AppServices;
