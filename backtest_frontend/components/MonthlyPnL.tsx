import React, { useEffect, useState } from "react";
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

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface CompanyPnl {
    company_id: number;
    company_name: string;
    dates: string[];
    values: number[];
}

export default function PnlChart({
    result,
    topCompanies,
}: {
    result: any,
    topCompanies: any;
}) {
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [chartKey, setChartKey] = useState(0);

    const [pnldata, setPnldata] = useState<[]>([]);

    useEffect(() => {
        if (!selectedCompanyId) return;

        fetch(`http://localhost:8000/${selectedCompanyId}/monthly_pnl`)
            .then(res => res.json())
            .then(setPnldata)
            .catch(err => console.error(err));
    }, [selectedCompanyId]);

    useEffect(() => {
        if (topCompanies?.length > 0) {
            setSelectedCompanyId(topCompanies[0].company_id);
        }
    }, [topCompanies]);

    useEffect(() => {
        setChartKey((prev) => prev + 1);
    }, [selectedCompanyId]);

    if (!topCompanies || topCompanies.length === 0) {
        return <div>No data available</div>;
    }

    const selectedCompany = topCompanies.find(
        (c: any) => c.company_id === selectedCompanyId
    );

    const data = {
        labels: selectedCompany?.dates || [],
        datasets: [
            {
                label: `${selectedCompany?.company_name} P&L`,
                data: selectedCompany?.values || [],
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
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
                text: "Monthly Profit & Loss",
            },
        },
    };

    return (
        <div>
            {
                result && (
                    <div className="mb-4">

                        <label>Select Company: </label>
                        <select
                            value={selectedCompanyId || ""}
                            onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                            className="border p-1"
                        >
                            {topCompanies.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c?.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            }


            {/* {selectedCompany && (
        <Line key={chartKey} data={data} options={options} />
      )} */}
        </div>
    );
}
