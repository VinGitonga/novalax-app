import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import HomeScreen from "./pages/HomeScreen";
import InstantPayments from "./pages/InstantPaymentsScreen";
import LandingPage from "./pages/LandingScreen";
import PaymentCheckout from "./pages/PaymentCheckout";
import RecurringPaymentCheckout from "./pages/RecurringPaymentCheckout";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import PlansPage from "./pages/PlansPage";
import PremiumFiles from "./pages/PremiumFiles";
import CompanyPayments from "./pages/CompanyPayments";

const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
            {
                path: "",
                element: <LandingPage />
            },
			{
				path: "/home",
				element: <HomeScreen />,
			},
			{
				path: "app",
				element: <AppLayout />,
				children: [
					{
						path: "",
						element: <Dashboard />,
					},
					{
						path: "subscriptions",
						element: <Subscriptions />,
					},
					{
						path: "plans",
						element: <PlansPage />,
					},
					{
						path: "files",
						element: <PremiumFiles />,
					},
					{
						path: "payments",
						element: <CompanyPayments />
					}
				],
			},
			{
				path: "make-payments/:businessId/:planId",
				element: <PaymentCheckout />,
			},
            {
				path: "instant/payments",
				element: <InstantPayments />,
			},
			{
				path: "recurring-payment-checkout",
				element: <RecurringPaymentCheckout />,
			},
		],
	},
]);

export default router;
