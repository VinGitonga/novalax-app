import { Img } from "react-image";
import { TbWallet, TbMoneybag, TbBox, TbLayout2 } from "react-icons/tb";
import { RxArrowTopRight } from "react-icons/rx";
import { type ReactNode } from "react";
import { CiGlobe } from "react-icons/ci";
import { Link, useNavigate } from "react-router";
import { Button, cn, Tooltip } from "@heroui/react";
import { useAccountStore } from "@/hooks/store/useAccountStore";
import { FaTelegram } from "react-icons/fa6";
import ConnectBtn from "@/components/web3/ConnectBtn";
import GetStartedModal from "@/components/dialogs/GetStartedModal";

interface HomeLinkProps {
	isActive?: boolean;
	text: string;
	href?: string;
}

interface FeatureCardProps {
	title: string;
	description: string;
	icon: ReactNode;
}

interface StepItemProps {
	title: string;
	description: string;
}

const LandingPage = () => {
	const { account } = useAccountStore();
	const navigate = useNavigate();

	const openTelegram = () => {
		window.open("https://t.me/novalax_bot", "_blank");
	};
	return (
		<div className="min-h-screen overflow-y-auto w-screen text-white bg-[#130D26] pt-4">
			<div className="mt-2 flex items-center justify-between px-20">
				<div className="flex items-center gap-3">
					<Link to={"/"}>
						<Img src="/images/logo2.png" className="w-20" width={100} height={100} alt="Logo" />
					</Link>
					<h1 className="text-5xl font-bold">Novalax</h1>
				</div>
				<div className="flex items-center gap-4">
					<HomeLink href="/" isActive text="Home" />
					<HomeLink href="/" text="Features" />
					<HomeLink href="/" text="How It Works" />
					<div className="ml-5">
						<ConnectBtn />
					</div>
				</div>
			</div>
			<div className="mt-2 grid grid-cols-1 md:grid-cols-8 pl-20">
				<div className="col-auto md:col-span-4 mt-12 space-y-10">
					<div className="text-6xl font-bold">
						<span>Pay, Get Paid with USDC</span>
						<span className="text-transparent bg-gradient-to-tr bg-clip-text from-[#FFFFFF] to-[#FF6106]"> Setup all your payments in one place</span>
					</div>
					<div className="mt-8">
						<p className="text-lg">Get started with a unified, secure, and developer-friendly platform for on-chain payments and monetization.</p>
					</div>
					<div className="mt-5 flex items-center gap-3">
						<ConnectBtn />
						{!account && <GetStartedModal />}
						{account && <Button onPress={() => navigate("/app")}>Go to Dashboard</Button>}
						<Tooltip content={"Access Telegram"}>
							<Button isIconOnly onPress={openTelegram}>
								<FaTelegram className="w-5 h-5" />
							</Button>
						</Tooltip>
					</div>
				</div>
				<div className="col-auto md:col-span-4">
					<Img src={"/images/hero-img.png"} alt="Hero" className="w-full" width={100} height={100} />
				</div>
			</div>
			<div className="px-20 mt-3 relative">
				<div className="absolute left-[30%] top-6 w-full pointer-events-none z-10">
					<Img src={"/images/eclipse-bg.png"} className="" width={700} alt="Hero" height={100} />
				</div>
				<div className="w-full relative z-20">
					<div className="text-center space-y-4">
						<h1 className="text-4xl font-semibold">Why Choose Novalax?</h1>
						<p className="text-lg px-10">
							We believe on-chain payments should be frictionless, not frustrating. We've built a platform that simplifies payments, so you can focus on building the future of the decentralized web.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-15">
						<FeatureCard
							title="Flexible Payment Rails"
							description="Choose the right payment model for your service. Use our smart contracts for recurring payments and subscriptions, or our x402-based solution for instant, pay-per-use microtransactions."
							icon={<TbWallet className="w-6 h-6" />}
						/>
						<FeatureCard title="Simple & Secure Integration" description="No complex blockchain knowledge is required to accept on-chain payments." icon={<TbMoneybag className="w-6 h-6" />} />
						<FeatureCard
							title="Powered by Hedera"
							description="Our platform is designed to handle payments with a focus on fast and low-cost transactions on the Hedera EVM network"
							icon={<TbBox className="w-6 h-6" />}
						/>
						<FeatureCard
							title="Stablecoin Native"
							description="All transactions are settled in stablecoins (USDC), providing a reliable and non-volatile payment experience for both you and your customers."
							icon={<TbLayout2 className="w-6 h-6" />}
						/>
					</div>
				</div>
			</div>
			<div className="px-24 mt-28">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<Img src={"/images/steps-img.png"} className="w-full" width={100} height={100} alt="Steps" />
					<div className="pt-5">
						<h1 className="font-semibold text-3xl">3 Steps to Pay or Get Paid</h1>
						<div className="space-y-6 mt-4">
							<StepItem title="Connect Wallet" description="Link your Etherlink wallet in seconds." />
							<StepItem title="Generate a link" description="Using Telegram AI agent or the Dashboard generate a payment link" />
							<StepItem title="Pay or Share" description="Link generated can be used to be pay used by others to pay" />
							{/* <StepItem title="Track Progress" description="Watch your portfolio grow" /> */}
						</div>
					</div>
				</div>
			</div>
			<div className="mt-5 bg-gradient-to-b from-[#130D26] to-[#FF6106] pt-5 px-20 relative">
				<div className="absolute left-0 -top-10 w-full pointer-events-none z-10">
					<Img src={"/images/blue-eclipse.png"} className="w-full" width={700} alt="Hero" height={100} />
				</div>
				<div className="flex flex-col items-center space-y-8 z-20 relative">
					<h1 className="text-3xl font-semibold">Ready to Start?</h1>
					<p className="text-lg">Connect your wallet and join the Novalax revolution today!</p>
					<ConnectBtn />
					<hr className="border-white w-full" />
				</div>
				<div className="flex items-center justify-between py-5 px-8">
					<div className="flex items-center gap-3">
						<Link to={"/"}>
							<Img src="/images/logo2.png" className="w-12" width={100} height={100} alt="Logo" />
						</Link>
						<h1 className="text-3xl font-bold">Novalax</h1>
					</div>
					{/* <Img src="/images/logo.png" className="w-32" width={100} height={50} alt="Logo" /> */}
					<p>&copy; 2025 Novalax. All Rights Reserved. </p>
					<CiGlobe className="w-6 h-6" />
				</div>
			</div>
		</div>
	);
};

const HomeLink = ({ text, isActive, href }: HomeLinkProps) => {
	return (
		<Link to={href ?? "/"}>
			<p
				className={cn(
					isActive
						? "text-[#FF6106] font-bold hover:underline hover:underline-offset-4 transition-all duration-300"
						: "hover:text-[#FF6106] hover:font-bold hover:underline hover:underline-offset-4 transition-all duration-300"
				)}>
				{text}
			</p>
		</Link>
	);
};

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
	return (
		<div className="p-[0.5px] rounded-2xl bg-gradient-to-r from-[#FF6106] to-[#FFFFFF]">
			<div className="px-3 py-4 bg-[#1C1337] rounded-2xl">
				<div className="flex items-center justify-between">
					<div className="size-10 bg-gradient-to-b from-[#1C1337] to-white rounded-full flex items-center justify-center">{icon}</div>
					<RxArrowTopRight className="w-6 h-6" />
				</div>
				<div className="mt-2 space-y-4">
					<h1 className="font-semibold text-lg">{title}:</h1>
					<p className="text-sm">{description}</p>
				</div>
			</div>
		</div>
	);
};

const StepItem = ({ title, description }: StepItemProps) => {
	return (
		<div className="flex gap-3">
			<Img src={"/images/steps-arrow-img.png"} width={40} height={10} alt="Arrow" />
			<div className="space-y-3">
				<h2 className="text-lg font-semibold">{title}</h2>
				<p className="text-sm">{description}</p>
			</div>
		</div>
	);
};

export default LandingPage;
