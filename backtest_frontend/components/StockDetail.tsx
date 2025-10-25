"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Line } from "react-chartjs-2";
import Button from "./Button";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Price = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

interface StockProps {
  name: any;
  id: number | null;
  symbol: any;
}

const StockDetail: React.FC<StockProps> = ({ symbol, name, id }) => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNews, setShowNews] = useState(false);
const [news, setNews] = useState<any[]>([]);
const [loadingNews, setLoadingNews] = useState(false);
const [errorNews, setErrorNews] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prices/${symbol}`)
      .then((res) => {
        setPrices(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (!id) {
    return (
      <div className="text-center text-gray-400 p-4">
        Select a company to view details
      </div>
    );
  }
  const fetchNews = async () => {
  setLoadingNews(true);
  setErrorNews("");
  setShowNews(true);

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/news/${symbol}`);
    setNews(res.data.news || []);
  } catch (err: any) {
    setErrorNews("Failed to load news. Please try again later.");
  } finally {
    setLoadingNews(false);
  }
};


  if (loading)
    return <div className="text-center text-gray-400 p-4">Loading...</div>;
  if (!prices.length)
    return <div className="text-center text-gray-400 p-4">No price data</div>;

  const labels = prices.map((p) => p.date);
  const data = {
    labels,
    datasets: [
      {
        label: "Close",
        data: prices.map((p) => p.close),
        borderColor: "#0ff", // cyan
        backgroundColor: "rgba(0,255,255,0.1)",
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 0,
      },
      {
        label: "Open",
        data: prices.map((p) => p.open),
        borderColor: "#a78bfa", // violet
        backgroundColor: "rgba(167,139,250,0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "High",
        data: prices.map((p) => p.high),
        borderColor: "#00e676", // green glow
        backgroundColor: "rgba(0,230,118,0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "Low",
        data: prices.map((p) => p.low),
        borderColor: "#ff4081", // pink highlight
        backgroundColor: "rgba(255,64,129,0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#ccc",
          font: {
            size: 13,
          },
        },
      },
      title: {
        display: true,
        text: `${name} — Price Overview`,
        color: "#a78bfa",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#999",
          maxTicksLimit: 10,
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
      y: {
        ticks: {
          color: "#999",
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  };
  

  return (
    <div className="w-full min-h-[30vw] bg-[#101524] rounded-2xl shadow-2xl border border-[#23283d] p-6 text-white">
      {/* Header */}
      {/* News Modal */}
{showNews && (
  <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#101524] border border-[#23283d] rounded-2xl w-[90%] lg:w-[60%] max-h-[80vh] overflow-y-auto p-6 shadow-2xl relative">
      <button
        onClick={() => setShowNews(false)}
        className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold text-[#a78bfa] mb-4">
        📰 Latest News for {symbol}
      </h2>

      {loadingNews ? (
        <p className="text-gray-400 text-center">Fetching latest news...</p>
      ) : errorNews ? (
        <p className="text-red-400 text-center">{errorNews}</p>
      ) : news.length > 0 ? (
        <div className="space-y-4">
          {news.map((n, i) => (
            <a
              key={i}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-[#23283d] hover:border-[#6a5acd] p-4 rounded-xl bg-[#141a29]/70 hover:bg-[#141a29]/90 transition-all"
            >
              <h3 className="text-lg font-semibold text-[#00e6e6] mb-1">
                {n.title}
              </h3>
              <p className="text-gray-400 text-sm mb-1">{n.source}</p>
              <p className="text-xs text-gray-500">{n.time}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">No recent news found.</p>
      )}
    </div>
  </div>
)}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-[#a78bfa]">
          {name} <span className="text-gray-400 text-sm">({symbol})</span>
        </h1>
      </div>

      {/* Chart */}
      <div className="bg-[#141a29]/70 backdrop-blur-lg p-4 rounded-xl border border-[#23283d]">
        <Line options={options} data={data} />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link href={`companies/${id}?symbol=${symbol}`}>
          <button className="px-5 py-2 bg-gradient-to-r from-[#6a5acd] to-[#805ad5] rounded-lg shadow hover:scale-105 transition-all">
            Detail Analysis
          </button>
        </Link>

        <button onClick={fetchNews}
 className="px-5 py-2 bg-gradient-to-r from-[#00c6ff] to-[#0072ff] rounded-lg shadow hover:scale-105 transition-all">
          Check News
        </button>
      </div>
    </div>
  );
};

export default StockDetail;
