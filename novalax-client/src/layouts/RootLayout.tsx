import AppServices from "@/components/layouts/AppServices";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { Outlet, useNavigate } from "react-router";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const RootLayout = () => {
	const navigate = useNavigate();
	return (
		<HeroUIProvider navigate={navigate}>
			<ToastProvider />
			<AppServices />
			<SonnerToaster />
			<div className="min-h-screen antialiased transition-colors ease-in-out duration-200 font-nunito">
				<Outlet />
			</div>
		</HeroUIProvider>
	);
};

export default RootLayout;
