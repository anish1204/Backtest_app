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

export default function BacktestPanel({ companyId }: { companyId: number }) {
  const [strategy, setStrategy] = useState("sma_crossover");
  const [params, setParams] = useState({ short_window: 20, long_window: 50 });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunBacktest = async () => {
    if (!companyId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/backtest/${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy,
          params,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!res.ok) throw new Error("Failed to run backtest");
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
    <div className="bg-white rounded-xl p-6 shadow-md mt-8 border border-green-200">
      <h2 className="text-2xl font-semibold text-green-800 mb-4">
        💹 Backtest & Strategy Simulation
      </h2>

      {/* STRATEGY SELECTOR */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="font-semibold text-green-900 block mb-1">
            Strategy
          </label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="border rounded p-2 outline-none w-48"
          >
            <option value="sma_crossover">SMA Crossover</option>
            <option value="rsi">RSI</option>
            <option value="buy_hold">Buy & Hold</option>
          </select>
        </div>

        {strategy === "sma_crossover" && (
          <>
            <div>
              <label className="font-semibold text-green-900 block mb-1">
                Short Window
              </label>
              <input
                type="number"
                className="border rounded p-2 w-32 outline-none"
                value={params.short_window}
                onChange={(e) =>
                  handleParamChange("short_window", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="font-semibold text-green-900 block mb-1">
                Long Window
              </label>
              <input
                type="number"
                className="border rounded p-2 w-32 outline-none"
                value={params.long_window}
                onChange={(e) =>
                  handleParamChange("long_window", Number(e.target.value))
                }
              />
            </div>
          </>
        )}

        {strategy === "rsi" && (
          <>
            <div>
              <label className="font-semibold text-green-900 block mb-1">
                Period
              </label>
              <input
                type="number"
                className="border rounded p-2 w-32 outline-none"
                onChange={(e) =>
                  handleParamChange("period", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="font-semibold text-green-900 block mb-1">
                Overbought
              </label>
              <input
                type="number"
                className="border rounded p-2 w-32 outline-none"
                onChange={(e) =>
                  handleParamChange("overbought", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label className="font-semibold text-green-900 block mb-1">
                Oversold
              </label>
              <input
                type="number"
                className="border rounded p-2 w-32 outline-none"
                onChange={(e) =>
                  handleParamChange("oversold", Number(e.target.value))
                }
              />
            </div>
          </>
        )}

        {/* Date filters */}
        <div>
          <label className="font-semibold text-green-900 block mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2 outline-none"
          />
        </div>
        <div>
          <label className="font-semibold text-green-900 block mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2 outline-none"
          />
        </div>
      </div>

      {/* RUN BUTTON */}
      <button
        onClick={handleRunBacktest}
        disabled={loading}
        className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900 transition"
      >
        {loading ? "Running..." : "Run Backtest"}
      </button>

      {error && (
        <p className="text-red-600 font-semibold mt-3">❌ {error}</p>
      )}

      {/* RESULTS */}
      {result && (
        <div className="mt-8">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Return" value={`${result.summary.total_return.toFixed(2)} %`} />
            <StatCard label="Win Rate" value={`${result.summary.win_rate.toFixed(1)} %`} />
            <StatCard label="Max Drawdown" value={`${result.summary.max_drawdown.toFixed(1)} %`} />
          </div>

          {/* Equity Curve */}
          <div className="bg-[#f5ffe3] rounded-lg p-4 shadow-inner">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              📈 Equity Curve
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={result.equity_curve}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#14532d"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trade Log */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🧾 Trade Log
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-green-800 text-white">
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
                    <tr key={i} className="border-b hover:bg-green-50">
                      <td className="px-4 py-2">{t.entry_date}</td>
                      <td className="px-4 py-2">{t.exit_date}</td>
                      <td className="px-4 py-2">{t.entry_price}</td>
                      <td className="px-4 py-2">{t.exit_price}</td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          t.return_pct >= 0 ? "text-green-700" : "text-red-600"
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f1f9bd] p-4 rounded-lg text-center shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold text-green-800">{value}</p>
    </div>
  );
}
