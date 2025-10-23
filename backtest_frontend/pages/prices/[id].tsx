// pages/prices/[id].tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

export default function PricesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prices/${id}`)
      .then((res) => {
        setPrices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!prices.length) return <div className="text-center p-4">No price data</div>;

  const labels = prices.map((p) => p.date);
  const data = {
    labels,
    datasets: [
      {
        label: "Close Price",
        data: prices.map((p) => p.close),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "Open Price",
        data: prices.map((p) => p.open),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
      {
        label: "High Price",
        data: prices.map((p) => p.high),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.2)",
      },
      {
        label: "Low Price",
        data: prices.map((p) => p.low),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Prices for Company ID: ${id}`,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Price Chart</h1>
      <Line options={options} data={data} />
    </div>
  );
}
