"use client";

import { useEffect, useState } from "react";
import { getWalletStats, WalletStats } from "@/app/actions/wallet-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, Coins, ArrowUpRight, Scale, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PRWalletCard() {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getWalletStats();
        if ("error" in res) {
          toast.error(res.error || "Failed to load wallet balance");
        } else {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
        toast.error("Network error fetching wallet details");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <Card className="w-full shadow-sm border border-zinc-100 dark:border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-sm text-zinc-500 font-medium">Calculating plastic rupee balance...</span>
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = stats?.totalEarnings ?? 0;
  const totalWeightKg = stats?.totalWeightKg ?? 0;
  const rate = stats?.rate ?? 15;
  const recentTransactions = stats?.recentTransactions ?? [];

  // Goal target for rewards/withdrawals: ₹1,000
  const GOAL_LIMIT = 1000;
  const progressPercent = Math.min((totalEarnings / GOAL_LIMIT) * 100, 100);

  // Format currency helper to standard INR
  const formatINR = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className="w-full overflow-hidden shadow-md border border-[#e8fccf] dark:border-zinc-800 transition-all duration-300 hover:shadow-lg">
      {/* Visual background gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-lime-400 w-full" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
            Plastic Rupee (PR) Wallet
          </CardTitle>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
          <Coins className="h-3.5 w-3.5" />
          <span>Real-time Earnings</span>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex flex-col gap-6">
        {/* Main Earnings Panel */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-lime-50/20 dark:from-zinc-900/50 dark:to-zinc-900/10 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
            Available Wallet Balance
          </div>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-baseline gap-1">
            {formatINR(totalEarnings)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
            <Scale className="h-3.5 w-3.5 text-zinc-400" />
            <span>
              <strong>{totalWeightKg.toFixed(1)} kg</strong> plastic collected ×{" "}
              <strong>{formatINR(rate)}/kg</strong> rate
            </span>
          </div>
        </div>

        {/* Dynamic Rewards Progress Target */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium flex items-center gap-1">
              Reward Goal Progress
              <span title="Unlock payouts or dynamic bonuses at ₹1,000" className="cursor-help">
                <Info className="h-3 w-3 text-zinc-400" />
              </span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatINR(totalEarnings)} / {formatINR(GOAL_LIMIT)}
            </span>
          </div>
          {/* Native high-fidelity progress bar mimicking Radix styles */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-lime-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Ledger Section */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Recent Transactions
          </div>
          {recentTransactions.length === 0 ? (
            <div className="text-sm text-zinc-400 py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No recent collection transactions found.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        {tx.weight.toFixed(1)} kg collected
                      </div>
                      <div className="text-xs text-zinc-400">
                        {tx.created_at ? formatDate(tx.created_at) : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-1 rounded-lg">
                    <span>+{formatINR(tx.earnings)}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
