import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import HomeScreen from "./pages/HomeScreen";
import InstantPayments from "./pages/InstantPaymentsScreen";
import LandingPage from "./pages/LandingScreen";

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
				path: "instant/payments",
				element: <InstantPayments />,
			},
		],
	},
]);

export default router;
