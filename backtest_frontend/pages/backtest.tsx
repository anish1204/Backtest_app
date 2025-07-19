import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Backtest() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [strategyId, setStrategyId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/strategies/")
      .then(res => res.json())
      .then(setStrategies)
      .catch(err => setError("Failed to fetch strategies"));
  }, []);

  const runBacktest = async () => {
    if (!strategyId || !start || !end) {
      setError("Please select strategy and date range");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_id: Number(strategyId),
          start_date: start,
          end_date: end,
        }),
      });
      if (!res.ok) throw new Error("Backtest failed");
      const data = await res.json();
      console.log("Backtest response:", data);

      // handle both possible response formats
      if (data.result) {
        setResult(data.result);
      } else if (data.data) {
        setResult(data.data);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Error running backtest");
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    result?.equity_curve?.dates?.length > 0
      ? {
          labels: result.equity_curve.dates,
          datasets: [
            {
              label: "Equity Curve",
              data: result.equity_curve.values,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
            },
          ],
        }
      : null;

  return (
    <div className="lg:mt-[6vw] p-8">
      <h1 className="text-2xl font-bold mb-4">📈 Run Backtest</h1>

      <div className="space-y-2 mb-4">
        <select
          onChange={e => setStrategyId(e.target.value)}
          value={strategyId}
          className="border p-2 w-full"
        >
          <option value="">Select Strategy</option>
          {strategies.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="border p-2 flex-1"
          />
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="border p-2 flex-1"
          />
        </div>

        <button
          onClick={runBacktest}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Running..." : "Run Backtest"}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">📄 Result</h2>
          <p>Backtest ID: {result.backtest_id}</p>
          <p>Strategy ID: {result.strategy_id}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.metrics &&
              Object.entries(result.metrics).map(([k, v]) => (
                <div
                  key={k}
                  className="bg-blue-100 p-4 rounded shadow text-center"
                >
                  <p className="font-semibold">{k}</p>
                  <p className="text-lg">{v}</p>
                </div>
              ))}
          </div>

          {chartData && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Equity Curve</h3>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxTicksLimit: 10,
                      },
                    },
                  },
                }}
              />
            </div>
          )}

          {result.logs?.trades?.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">📋 Trades</h3>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2">Date</th>
                    <th className="border px-2">Symbol</th>
                    <th className="border px-2">Action</th>
                    <th className="border px-2">Quantity</th>
                    <th className="border px-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {result.logs.trades.map((trade: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border px-2">{trade.date}</td>
                      <td className="border px-2">{trade.symbol}</td>
                      <td className="border px-2">{trade.action}</td>
                      <td className="border px-2">{trade.qty}</td>
                      <td className="border px-2">{trade.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
