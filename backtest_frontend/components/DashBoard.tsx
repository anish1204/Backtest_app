import React, { useEffect, useState } from "react";
import AllocationChart from "./AllocationChart";
// import MonthlyPnL from "./MonthlyPnL";
import PnlChart from "./MonthlyPnL";
import DownloadAnalytics from "./DownloadAnalytics";

const Dashboard = () => {
    const [strategies, setStrategies] = useState<any[]>([]);
    const [strategyId, setStrategyId] = useState<number | null>(null);
    const [start, setStart] = useState("");
    const [top10Companies, setTop10Companies] = useState<any[]>([])
    const [end, setEnd] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [initialCapital, setInitialCapital] = useState<number>(100000);
    const [roe, setRoe] = useState<number>(15);

    const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
    const [pnlData, setPnlData] = useState<{ dates: string[], returns: number[] } | null>(null);

    // top 10 companies
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/top10`)
            .then(res => res.json())
            .then(data => {
                setTop10Companies(data);
                console.log(data, 'daat')
                if (data.length > 0) setSelectedCompany(data[0].company_id);
            });
    }, []);

    // fetch monthly pnl for selected company
    useEffect(() => {
        if (!selectedCompany) return;
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/${selectedCompany}/monthly_pnl`)
            .then(res => res.json())
            .then(setPnlData)
            .catch(err => console.error(err));
    }, [selectedCompany]);


    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/strategies/`)
            .then((res) => res.json())
            .then((data) => {
                setStrategies(data);
                if (data.length > 0) setStrategyId(data[0].id);
            })
            .catch(() => setError("Failed to fetch strategies"));
    }, []);
    const data = {
        labels: pnlData?.dates || [],
        datasets: [
            {
                label: "Monthly P&L (%)",
                data: pnlData?.returns || [],
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    };


    const handleSubmit = async () => {
        if (!strategyId || !start || !end || !initialCapital) {
            setError("Fill all fields properly");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    strategy_id: strategyId,
                    start_date: start,
                    end_date: end,
                    initial_capital: initialCapital,
                    roe_min: roe,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || "Something went wrong");
            } else {
                setResult(data);
            }
        } catch (err) {
            setError("Request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:mt-[6vw] lg:flex-row gap-4 p-4">
            {/* Left: Filters */}
            <div className="lg:w-1/3 border rounded-lg p-4 space-y-4">
                <select
                    className="w-full border border-gray-300 rounded-lg py-1"
                    value={strategyId || ""}
                    onChange={(e) => setStrategyId(Number(e.target.value))}
                >
                    {strategies?.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    placeholder="Initial Capital"
                    className="w-full border px-2 border-gray-300 rounded-lg py-1"
                />

                <div className="flex gap-x-2">
                    <input
                        type="number"
                        value={roe}
                        onChange={(e) => setRoe(Number(e.target.value))}
                        placeholder="ROE"
                        className="border px-2 border-gray-300 rounded-lg py-1 flex-1"
                    />
                    <button
                        onClick={() => setRoe(roe + 1)}
                        className="border px-2 border-gray-300 rounded-lg"
                    >
                        +
                    </button>
                    <button
                        onClick={() => roe > 1 && setRoe(roe - 1)}
                        className="border px-2 border-gray-300 rounded-lg"
                    >
                        -
                    </button>
                </div>

                <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full border px-2 border-gray-300 rounded-lg py-1"
                />

                <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full border px-2 border-gray-300 rounded-lg py-1"
                />

                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 text-white py-2 rounded mt-4"
                    disabled={loading}
                >
                    {loading ? "Running..." : "Run Backtest"}
                </button>

                {error && <p className="text-red-500">{error}</p>}

                {result && (
                    <>
                        <div className="mt-4 text-xs">
                            <h3 className="font-bold">Total Return: {result?.metrics['Total Return']}%</h3>
                            <h3 className="font-bold">CAGR: {result?.metrics['CAGR']}</h3>
                            <h3 className="font-bold">Sharpe: {result?.metrics['Sharpe']}</h3>
                            {/* <pre>{JSON.stringify(result.metrics, null, 2)}</pre> */}
                        </div>
                        <DownloadAnalytics result={result} />
                    </>

                )}
            </div>

            {/* Right: Chart */}
            <div className="flex-1 border rounded-lg p-4">
                {result?.allocation_history ? (
                    <AllocationChart allocationHistory={result.allocation_history} />
                ) : (
                    <p className="text-gray-400">Run a backtest to see the chart</p>
                )}
                <PnlChart result={result} topCompanies={top10Companies} />

            </div>
        </div>
    );
};

export default Dashboard;
