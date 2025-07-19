import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AllocationChartProps {
  allocationHistory: {
    date: string;
    allocations: Record<string, number>;
  }[];
}

const AllocationChart: React.FC<AllocationChartProps> = ({ allocationHistory }) => {
  const dates = allocationHistory.map((d) => d.date);
  const companyIds = Object.keys(allocationHistory[0]?.allocations || {});

  const datasets = companyIds.map((id) => ({
    label: `Company ${id}`,
    data: allocationHistory.map((d) => d.allocations[id]),
  }));

  const data = {
    labels: dates,
    datasets: datasets.map((ds, idx) => ({
      ...ds,
      backgroundColor: `hsl(${(idx * 40) % 360}, 70%, 50%)`,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Quarterly Allocation per Company",
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default AllocationChart;
