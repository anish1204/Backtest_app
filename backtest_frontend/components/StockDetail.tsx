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
    name:any;
    id: number | null;
    symbol:any;
}

const StockDetail: React.FC<StockProps> = ({symbol,name, id }) => {
    const [prices, setPrices] = useState<Price[]>([]);
    const [loading, setLoading] = useState(false);

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
        return <div className="text-center p-4">Select a company to view details</div>;
    }

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
                text: `Prices`,
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
        <div className=" lg:min-h-[30vw] max-lg:h-[350px] w-[100%]">
            <div className="container border-[1px]  border-gray-200 mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">{name}</h1>
                <Line options={options} data={data} />
            </div>
            <div className="flex max-lg:flex-col gap-[1rem] mt-[1rem] max-lg:w-fit lg:mt-[1vw] lg:gap-[1vw]">
                <Link href={`companies/${id}?symbol=${symbol}`}>
                    <Button color={"yellow"} title="Detail Analysis" />
                </Link>
                <div onClick={()=>{}}>
                    <Button color={""} title="Check News" />
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
