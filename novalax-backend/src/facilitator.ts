import express from "express";
import cors from "cors";
import facilitatorRouter from "./routes/facilitator.route";
import { logger } from "./logger/winston";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
	res.send("Hello Novalax Facilitator Node");
});

app.use("/", facilitatorRouter);

app.get(/(.*)/, (req: express.Request, res: express.Response) => {
	res.status(500).json({ success: false, msg: "Internal Server Error" });
});

app.listen(6099, () => {
	logger.info(`Facilitator Server Started at: http://localhost:6099`);
});
