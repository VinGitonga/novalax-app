import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import HomeScreen from "./pages/HomeScreen";
import InstantPayments from "./pages/InstantPaymentsScreen";
import LandingPage from "./pages/LandingScreen";
import PaymentCheckout from "./pages/PaymentCheckout";
import RecurringPaymentCheckout from "./pages/RecurringPaymentCheckout";

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
