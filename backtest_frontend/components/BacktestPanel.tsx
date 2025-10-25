"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BacktestResult {
  summary: {
    total_return: number;
    win_rate: number;
    max_drawdown: number;
  };
  equity_curve: { date: string; value: number }[];
  trades: {
    entry_date: string;
    exit_date: string;
    entry_price: number;
    exit_price: number;
    return_pct: number;
  }[];
}

export default function BacktestPanel({ symbol }: { symbol: any }) {
  const [strategy, setStrategy] = useState("sma_crossover");
  const [params, setParams] = useState({
    short_window: 20,
    long_window: 50,
    period: 14,
    overbought: 70,
    oversold: 30,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunBacktest = async () => {
    if (!symbol) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/backtest/${symbol}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy,
          params,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!res.ok) throw new Error("Backtest failed");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-[#141a29]/70 backdrop-blur-lg border border-[#23283d] rounded-2xl p-6 mt-10 text-white shadow-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-[#a78bfa] flex items-center gap-2">
        💹 Backtest & Strategy Simulation
      </h2>

      {/* STRATEGY SELECTION */}
      <div className="flex flex-wrap gap-5 mb-6">
        <div>
          <label className="font-semibold text-gray-300 block mb-1">
            Strategy
          </label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="bg-[#101524] border border-[#23283d] text-white rounded-md p-2 w-48 outline-none focus:ring-2 focus:ring-[#6a5acd]"
          >
            <option value="sma_crossover">SMA Crossover</option>
            <option value="rsi">RSI</option>
            <option value="buy_hold">Buy & Hold</option>
          </select>
        </div>

        {/* SMA Params */}
        {strategy === "sma_crossover" && (
          <>
            <ParamInput
              label="Short Window"
              value={params.short_window}
              onChange={(v) => handleParamChange("short_window", v)}
            />
            <ParamInput
              label="Long Window"
              value={params.long_window}
              onChange={(v) => handleParamChange("long_window", v)}
            />
          </>
        )}

        {/* RSI Params */}
        {strategy === "rsi" && (
          <>
            <ParamInput
              label="Period"
              value={params.period}
              onChange={(v) => handleParamChange("period", v)}
            />
            <ParamInput
              label="Overbought"
              value={params.overbought}
              onChange={(v) => handleParamChange("overbought", v)}
            />
            <ParamInput
              label="Oversold"
              value={params.oversold}
              onChange={(v) => handleParamChange("oversold", v)}
            />
          </>
        )}

        {/* Date Range */}
        <div>
          <label className="font-semibold text-gray-300 block mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#101524] border border-[#23283d] text-white rounded-md p-2 outline-none focus:ring-2 focus:ring-[#6a5acd]"
          />
        </div>
        <div>
          <label className="font-semibold text-gray-300 block mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#101524] border border-[#23283d] text-white rounded-md p-2 outline-none focus:ring-2 focus:ring-[#6a5acd]"
          />
        </div>
      </div>

      {/* RUN BUTTON */}
      <button
        onClick={handleRunBacktest}
        disabled={loading}
        className="bg-gradient-to-r from-[#6a5acd] to-[#805ad5] px-6 py-2 rounded-lg text-white font-medium shadow-lg hover:shadow-[#6a5acd]/50 hover:scale-105 transition-all disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Backtest"}
      </button>

      {error && <p className="text-red-400 font-semibold mt-3">❌ {error}</p>}

      {/* RESULTS */}
      {result && (
        <div className="mt-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Total Return"
              value={`${result.summary.total_return.toFixed(2)} %`}
              color="from-[#00e6e6] to-[#0099ff]"
            />
            <StatCard
              label="Win Rate"
              value={`${result.summary.win_rate.toFixed(1)} %`}
              color="from-[#a78bfa] to-[#805ad5]"
            />
            <StatCard
              label="Max Drawdown"
              value={`${result.summary.max_drawdown.toFixed(1)} %`}
              color="from-[#ff4081] to-[#ff6ec7]"
            />
          </div>

          {/* Equity Curve */}
          <div className="bg-[#101524] border border-[#23283d] rounded-xl p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[#a78bfa] mb-3">
              📈 Equity Curve
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={result.equity_curve}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 10 }} />
                <YAxis tick={{ fill: "#aaa", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141a29",
                    border: "1px solid #6a5acd",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00e6e6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#a78bfa", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trade Log */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-[#a78bfa] mb-3">
              🧾 Trade Log
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#23283d]">
              <table className="min-w-full text-sm text-gray-300">
                <thead className="bg-[#1e1b3a] text-[#a78bfa]">
                  <tr>
                    <th className="px-4 py-2 text-left">Entry</th>
                    <th className="px-4 py-2 text-left">Exit</th>
                    <th className="px-4 py-2 text-left">Entry Price</th>
                    <th className="px-4 py-2 text-left">Exit Price</th>
                    <th className="px-4 py-2 text-left">Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((t, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#23283d] hover:bg-[#1b1f32] transition"
                    >
                      <td className="px-4 py-2">{t.entry_date}</td>
                      <td className="px-4 py-2">{t.exit_date}</td>
                      <td className="px-4 py-2">{t.entry_price}</td>
                      <td className="px-4 py-2">{t.exit_price}</td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          t.return_pct >= 0 ? "text-[#00e676]" : "text-[#ff4081]"
                        }`}
                      >
                        {t.return_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ParamInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="font-semibold text-gray-300 block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-[#101524] border border-[#23283d] text-white rounded-md p-2 w-32 outline-none focus:ring-2 focus:ring-[#6a5acd]"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className={`p-4 rounded-xl text-center shadow-lg bg-gradient-to-br ${color} opacity-90`}
    >
      <p className="text-sm text-gray-100">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
