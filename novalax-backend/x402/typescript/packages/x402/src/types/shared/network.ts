import { z } from "zod";

export const NetworkSchema = z.enum([
  "base-sepolia",
  "base",
  "avalanche-fuji",
  "avalanche",
  "iotex",
  "etherlink-testnet",
]);
export type Network = z.infer<typeof NetworkSchema>;

export const SupportedEVMNetworks: Network[] = [
  "base-sepolia",
  "base",
  "avalanche-fuji",
  "avalanche",
  "iotex",
  "etherlink-testnet",
];
export const EvmNetworkToChainId = new Map<Network, number>([
  ["base-sepolia", 84532],
  ["base", 8453],
  ["avalanche-fuji", 43113],
  ["avalanche", 43114],
  ["iotex", 4689],
  ["etherlink-testnet", 128123],
]);

export const ChainIdToNetwork = Object.fromEntries(
  SupportedEVMNetworks.map(network => [EvmNetworkToChainId.get(network), network]),
) as Record<number, Network>;
