// src/utils/solana.ts
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = "https://api.mainnet-beta.solana.com"; // or Helius RPC
export const connection = new Connection(RPC_URL, "confirmed");

export async function getBalance(walletAddress: string) {
  const publicKey = new PublicKey(walletAddress);
  const balance = await connection.getBalance(publicKey);
  return balance / 1e9; // lamports → SOL
}

export async function getTransactions(walletAddress: string, limit = 10) {
  const publicKey = new PublicKey(walletAddress);
  const signatures = await connection.getSignaturesForAddress(publicKey, {
    limit,
  });

  return Promise.all(
    signatures.map(async (sig) => {
      const tx = await connection.getTransaction(sig.signature, {
        commitment: "confirmed",
      });
      return { signature: sig.signature, slot: sig.slot, tx };
    })
  );
}

/**
 * Subscribe to balance changes
 */
export function subscribeBalance(
  walletAddress: string,
  callback: (balance: number) => void
) {
  const publicKey = new PublicKey(walletAddress);

  return connection.onAccountChange(publicKey, async (accountInfo) => {
    const balance = accountInfo.lamports / 1e9;
    callback(balance);
  });
}

/**
 * Subscribe to transaction logs
 */
export function subscribeTransactions(
  walletAddress: string,
  callback: (signature: string) => void
) {
  const publicKey = new PublicKey(walletAddress);

  return connection.onLogs(publicKey, (log) => {
    callback(log.signature);
  });
}
