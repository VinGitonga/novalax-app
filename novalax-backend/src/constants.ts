import * as dotenv from "dotenv";

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const APP_PORT = "8745";
export const MONGODB_URI = process.env.MONGODB_URI;
export const CONTRACT_ADDRESS = "0x33763D18a61f846F90aE610d6B699cd309dAc31E";
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
export const API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:8745/api" : "https://novix_pay_api.vingitonga.xyz/api";
export const FACILITATOR_URL = process.env.NODE_ENV === "development" ? "http://localhost:6099" : "https://novix_pay_api_facilitator.vingitonga.xyz";
export const CLIENT_URL = process.env.NODE_ENV === "development" ? "http://localhost:5173" : "https://novix_pay.vingitonga.xyz";
export const USDC_CONTRACT_ADDRESS = "0xCb258F69530b881C24F9982e349E559C92476770" as `0x${string}`
export const PINATA_GATEWAY="green-favourable-earthworm-130.mypinata.cloud"
export const PINATA_API_KEY = process.env.PINATA_API_KEY
export const PINATA_API_SECRET = process.env.PINATA_API_SECRET
export const PINATA_JWT = process.env.PINATA_JWT

