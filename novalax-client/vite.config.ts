import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			x402: path.resolve(__dirname, "./x402-typescript/packages/x402/src"),
			"x402/*": path.resolve(__dirname, "./x402-typescript/packages/x402/src/*"),
			"x402-express": path.resolve(__dirname, "./x402-typescript/packages/x402-express/src"),
			"x402-express/*": path.resolve(__dirname, "./x402-typescript/packages/x402-express/src/*"),
			"x402-hono": path.resolve(__dirname, "./x402-typescript/packages/x402-hono/src"),
			"x402-hono/*": path.resolve(__dirname, "./x402-typescript/packages/x402-hono/src/*"),
			"x402-next": path.resolve(__dirname, "./x402-typescript/packages/x402-next/src"),
			"x402-next/*": path.resolve(__dirname, "./x402-typescript/packages/x402-next/src/*"),
			"x402-fetch": path.resolve(__dirname, "./x402-typescript/packages/x402-fetch/src"),
			"x402-fetch/*": path.resolve(__dirname, "./x402-typescript/packages/x402-fetch/src/*"),
			"x402-axios": path.resolve(__dirname, "./x402-typescript/packages/x402-axios/src"),
			"x402-axios/*": path.resolve(__dirname, "./x402-typescript/packages/x402-axios/src/*"),
			"@coinbase/x402": path.resolve(__dirname, "./x402-typescript/packages/coinbase-x402/src"),
			"@coinbase/x402/*": path.resolve(__dirname, "./x402-typescript/packages/coinbase-x402/src/*"),
		},
	},
	server: {
		port: 4112,
	},
});
