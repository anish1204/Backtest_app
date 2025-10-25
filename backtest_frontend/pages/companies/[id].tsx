"use client";
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
import BacktestPanel from "@/components/BacktestPanel";

export default function CompanyDetail() {
  const router = useRouter();
  const { id, symbol } = router.query;

  const [prices, setPrices] = useState<any[]>([]);
  const [fundamentals, setFundamentals] = useState<any>({});
  const [company, setCompany] = useState<any>({});
  const [metric, setMetric] = useState("close");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/${id}`)
      .then((res) => res.json())
      .then(setCompany);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prices/${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        const priceArray = data.data || [];
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
  if (!symbol) return;

  // Construct query parameters
  const params = new URLSearchParams();
  if (fromDate) params.append("start_date", fromDate);
  if (toDate) params.append("end_date", toDate);

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/prices/${symbol}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const priceArray = data.data || [];
      const sorted = priceArray.sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setPrices(sorted);
    })
    .catch((err) => console.error("Error fetching prices:", err));
}, [symbol, fromDate, toDate]);

  const filteredPrices = prices.filter((p) => {
    const d = new Date(p.date);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > new Date(toDate)) return false;
    return true;
  });

  const values = filteredPrices.map((p) => p[metric]);
  const summary = values.length
    ? {
        avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
        min: Math.min(...values).toFixed(2),
        max: Math.max(...values).toFixed(2),
      }
    : { avg: "—", min: "—", max: "—" };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white px-6 lg:px-10 pt-[6rem] pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#a78bfa] tracking-wide">
            {company.name || ""}
          </h1>
          {company.symbol && (
            <p className="text-gray-400 text-sm mt-1">
              {company.symbol} • {company.sector}
            </p>
          )}
        </div>

        <button
          onClick={() => router.back()}
          className="mt-4 lg:mt-0 bg-gradient-to-r from-[#6a5acd] to-[#805ad5] text-white rounded-md px-5 py-2 font-medium hover:scale-105 transition-all shadow-lg"
        >
          ← Back
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-[#141a29]/60 backdrop-blur-lg border border-[#23283d] p-5 rounded-xl shadow-lg mb-10">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="text-gray-300 font-semibold mr-2">Metric:</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="bg-[#101524] border border-[#23283d] text-white rounded-md p-2 outline-none"
            >
              <option value="close">Close</option>
              <option value="high">High</option>
              <option value="low">Low</option>
              <option value="avg">Average</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 font-semibold">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-[#101524] border border-[#23283d] text-white rounded-md p-2 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-300 font-semibold">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-[#101524] border border-[#23283d] text-white rounded-md p-2 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#141a29]/70 border border-[#23283d] p-6 rounded-xl shadow-2xl backdrop-blur-lg">
        <h2 className="text-xl font-semibold mb-5 text-[#a78bfa]">
          📊 {metric.charAt(0).toUpperCase() + metric.slice(1)} Price Chart
        </h2>

        {filteredPrices.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredPrices}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#aaa" }} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#aaa" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101524",
                    border: "1px solid #6a5acd",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke="#00e6e6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#a78bfa" }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="mt-8 flex flex-wrap justify-around gap-6 bg-[#101524] border border-[#23283d] rounded-xl p-5">
              <div className="text-[#00e676] font-semibold text-lg">
                📈 Max: {summary.max}
              </div>
              <div className="text-[#ff4081] font-semibold text-lg">
                📉 Min: {summary.min}
              </div>
              <div className="text-[#a78bfa] font-semibold text-lg">
                📊 Avg: {summary.avg}
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">
            No price data in selected range.
          </p>
        )}
      </div>

      {/* Backtest Panel */}
      {symbol && (
        <div className="mt-10">
          <BacktestPanel symbol={symbol} />
        </div>
      )}
    </div>
  );
}
