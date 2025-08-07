import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import HomeScreen from "./pages/HomeScreen";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <HomeScreen />,
      },
    ],
  },
]);

export default router;
