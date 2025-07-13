// pages/fundamentals/[id].tsx

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

// Inside your return:



type Fundamental = {
  id: number;
  company_id: number;
  date: string;
  metric: string;
  value: number;
};

export default function FundamentalsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [chartData, setChartData] = useState<any>(null);


  const [fundamentals, setFundamentals] = useState<Fundamental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:8000/fundamentals/${id}`)
      .then((res) => {
        setFundamentals(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);
  useEffect(() => {
  if (!id) return;

  axios.get(`http://localhost:8000/fundamentals/${id}`).then((res) => {
    setFundamentals(res.data);
    setLoading(false);

    // Optional: filter for one metric to chart
    const revenue = res.data
      .filter((f: Fundamental) => f.metric === "financials_Total Revenue")
      .sort((a: Fundamental, b: Fundamental) => a.date.localeCompare(b.date));

    if (revenue.length) {
      setChartData({
        labels: revenue.map((r: Fundamental) => r.date),
        datasets: [
          {
            label: "Revenue",
            data: revenue.map((r: Fundamental) => r.value),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
        ],
      });
    }
  });
}, [id]);


  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!fundamentals.length) return <div className="text-center p-4">No fundamentals data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fundamentals for Company ID: {id}</h1>
      {chartData && (
  <div className="mb-8">
    <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
  </div>
)}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Metric</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Value</th>
            </tr>
          </thead>
          <tbody>
            {fundamentals.map((f) => (
              <tr key={f.id} className="border-b">
                <td className="py-2 px-4">{f.metric}</td>
                <td className="py-2 px-4">{f.date}</td>
                <td className="py-2 px-4">{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
