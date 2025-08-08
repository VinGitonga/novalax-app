import express from "express";
import cors from "cors";
import { morganMiddleware } from "./middlewares/morgan.middleware";
import DatabaseConnection from "./db/connect";
import { logger } from "./logger/winston";
import { APP_PORT } from "./constants";
import accountRouter from "./routes/account.route";
import planRouter from "./routes/plan.route";
import paymentRouter from "./routes/payment.route";
import usdcRouter from "./routes/usdc-test.route";
import subscriptionRouter from "./routes/subscription.route";
import documentsRouter from "./routes/documents.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use(cors());

async function initializeDatabase() {
	try {
		const dbConnection = DatabaseConnection.getInstance();
		await dbConnection.connect();
		logger.info("Database connected successfully");
	} catch (error) {
		logger.error("Failed to connect to the database", error);
		process.exit(1);
	}
}

async function main() {
	await initializeDatabase();

	app.get("/", (req, res) => {
		res.send("Hi 👋 Novalax Peps");
	});
	app.use("/api/accounts", accountRouter);
	app.use("/api/plans", planRouter)
	app.use("/api/payments", paymentRouter)
	app.use("/api/usdc-test", usdcRouter)
	app.use("/api/subscriptions", subscriptionRouter)
	app.use("/api/documents", documentsRouter)

    app.listen(APP_PORT, () => {
		logger.info(`Server started at http://localhost:${APP_PORT}`);
	});

	// Catch-all route should be the very last route
	app.get(/(.*)/, (req: express.Request, res: express.Response) => {
		res.status(404).json({ success: false, msg: "Route not found" });
	});
}

main();
