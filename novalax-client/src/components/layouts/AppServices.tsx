import useHandleUniversalProviderCleanUp from "@/hooks/useHandleUniversalProviderCleanUp";
import useLoadAccountData from "@/hooks/useLoadAccountData";
import type { FC, ReactNode } from "react";

interface AppServicesProps {
	children?: ReactNode;
}

const AppServices: FC<AppServicesProps> = ({ children }) => {
	useHandleUniversalProviderCleanUp();
	useLoadAccountData()
	return <>{children}</>;
};

export default AppServices;
