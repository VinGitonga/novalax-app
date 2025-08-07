import { createLogger, format, transports } from "winston";

export const logger = createLogger({
	transports: [new transports.Console()],
	format: format.combine(
		format.colorize(),
		format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
		format.printf(({ timestamp, level, message }) => {
			return `[${timestamp}] ${level}: ${message}`;
		})
	),
});

export const morganLogger = createLogger({
	transports: [new transports.Console()],
	format: format.combine(
		format.colorize(),
		format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
		format.printf(({ timestamp, level, message }) => {
			return `[${timestamp}] ${level}: ${message}`;
		})
	),
	level: "http",
});
