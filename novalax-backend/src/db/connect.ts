import mongoose from "mongoose";
import { MONGODB_URI } from "src/constants";

class DatabaseConnection {
	private static instance: DatabaseConnection;
	private isConnected: boolean = false;

	private constructor() {}

	public static getInstance(): DatabaseConnection {
		if (!DatabaseConnection.instance) {
			DatabaseConnection.instance = new DatabaseConnection();
		}
		return DatabaseConnection.instance;
	}

	public async connect(): Promise<void> {
		if (this.isConnected) {
			console.log("Database already connected");
			return;
		}

		try {
			const mongoUri = MONGODB_URI;

			await mongoose.connect(mongoUri, {
				authSource: "admin",
			});

			this.isConnected = true;
			console.log("Database connected successfully");

			// Handle connection events
			mongoose.connection.on("error", (err) => {
				console.error("Database connection error:", err);
				this.isConnected = false;
			});

			mongoose.connection.on("disconnected", () => {
				console.log("Database disconnected");
				this.isConnected = false;
			});

			// Graceful shutdown
			process.on("SIGINT", async () => {
				await this.disconnect();
				process.exit(0);
			});
		} catch (error) {
			console.error("Database connection failed:", error);
			this.isConnected = false;
			throw error;
		}
	}

	public async disconnect(): Promise<void> {
		if (!this.isConnected) {
			return;
		}

		try {
			await mongoose.disconnect();
			this.isConnected = false;
			console.log("Database disconnected successfully");
		} catch (error) {
			console.error("Error disconnecting from database:", error);
			throw error;
		}
	}

	public getConnectionStatus(): boolean {
		return this.isConnected;
	}
}

export default DatabaseConnection;
