// src/App.tsx
import { useState } from "react";
import {
  getBalance,
  getTransactions,
  subscribeBalance,
  subscribeTransactions,
  connection, // <-- add this import if exported from utils/solana
} from "./utils/solana";
import type { Transaction } from "./types/Transaction";

function App() {
  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptionIds, setSubscriptionIds] = useState<number[]>([]);
  
  //when track transactions in real time, work in settimer
  const handleTrack = async () => {
    if (!wallet) return;

    // Reset previous subscriptions
    subscriptionIds.forEach((id) => {
      connection.removeAccountChangeListener(id).catch(() => {});
      connection.removeOnLogsListener(id).catch(() => {});
    });

    // Fetch initial data
    const bal = await getBalance(wallet);
    setBalance(bal);

    const txs = await getTransactions(wallet);
    setTransactions(txs);

    // Subscribe to balance changes
    const balanceSub = subscribeBalance(wallet, (newBalance) => {
      setBalance(newBalance);
    });

    // Subscribe to new transactions
    const txSub = subscribeTransactions(wallet, async () => {
      const txs = await getTransactions(wallet);
      setTransactions(txs);
    });

    setSubscriptionIds([balanceSub, txSub]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🔎 Solana Wallet Tracker</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="p-2 rounded bg-gray-800 border border-gray-600 w-full"
          type="text"
          placeholder="Enter wallet address..."
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
        <button
          onClick={handleTrack}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Track
        </button>
      </div>

      {balance !== null && (
        <p className="mb-4">💰 Balance: {balance.toFixed(4)} SOL</p>
      )}

      <h2 className="text-xl mb-2">Recent Transactions</h2>
      <ul className="space-y-2">
        {transactions.map((t) => (
          <li key={t.signature} className="p-2 bg-gray-800 rounded">
            <a
              href={`https://solscan.io/tx/${t.signature}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400"
            >
              {t.signature.slice(0, 20)}...
            </a>{" "}
            (slot: {t.slot})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
