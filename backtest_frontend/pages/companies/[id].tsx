import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Backtest from "../backtest";
import BacktestPanel from "@/components/BacktestPanel";

export default function CompanyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [prices, setPrices] = useState<any[]>([]);
  const [fundamentals, setFundamentals] = useState<any>({});
  const [company, setCompany] = useState<any>({});

  const [metric, setMetric] = useState("close");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { symbol } = router?.query;

  useEffect(() => {
    if (!id) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/${id}`)
      .then((res) => res.json())
      .then(setCompany);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prices/${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        const priceArray = data.data || []; // ✅ Extract the real array
        // ensure sorted ascending by date
        const sorted = priceArray.sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setPrices(sorted);
      })
      .catch((err) => console.error("Error fetching prices:", err));


    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fundamentals/${id}`)
      .then((res) => res.json())
      .then(setFundamentals);
  }, [id]);

  useEffect(() => {
    console.log(company, 'test')
  }, [company])

  // Filter prices by date range
  const filteredPrices = prices.filter((p) => {
    const d = new Date(p.date);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > new Date(toDate)) return false;
    return true;
  });

  // Compute summary stats for selected metric
  const values = filteredPrices.map((p) => p[metric]);
  const summary = values.length
    ? {
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
    }
    : { avg: "—", min: "—", max: "—" };

  return (
    <div className="min-h-screen bg-[#f5ffe3] lg:mt-[3vw] p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800 roboto">
            {company.name || ""}
          </h1>
          {/* <p className="text-gray-700 text-sm mt-1">
            {company.symbol} • {company.sector}
          </p> */}
        </div>

      </div>

      {/* Filter Controls */}
      <div className="flex flex-col w-100 justify-between lg:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <div>

          <button
            onClick={() => router.back()}
            className="mt-4 lg:mt-0 bg-green-800 text-white rounded-lg px-4 py-2 hover:bg-green-900 transition"
          >
            ← Back
          </button>
        </div>
        <div className="flex gap-2  items-center">

          <div>

            <label className="text-green-900 font-semibold">Metric:</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="border rounded p-2 outline-none"
            >
              <option value="close">Close</option>
              <option value="high">High</option>
              <option value="low">Low</option>
              <option value="avg">Average</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-green-900 font-semibold">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded p-2 outline-none"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-green-900 font-semibold">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded p-2 outline-none"
            />
          </div>
        </div>

      </div>

      {/* Price Chart */}
      <div className="bg-white shadow-md p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-800">
          📊 {metric.charAt(0).toUpperCase() + metric.slice(1)} Price Chart
        </h2>

        {filteredPrices.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={filteredPrices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke="#14532d"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="mt-6 flex flex-wrap gap-4 justify-around bg-[#f1f9bd] rounded-lg p-4">
              <div className="text-green-900 font-semibold">📈 Max: {summary.max}</div>
              <div className="text-green-900 font-semibold">📉 Min: {summary.min}</div>
              <div className="text-green-900 font-semibold">📊 Avg: {summary.avg}</div>
            </div>
          </>
        ) : (
          <p className="text-gray-600 text-sm">No price data in selected range.</p>
        )}
      </div>
      {
        symbol && (

          <BacktestPanel symbol={symbol} />

        )
      }

    </div>
  );
}
