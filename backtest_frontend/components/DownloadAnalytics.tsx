import React from "react";

export default function DownloadAnalytics({ result }: { result: any }) {
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backtest_${result.backtest_id}.json`;
    link.click();
  };

  const downloadCSV = () => {
    let csv = "";

    // 📈 Metrics
    csv += "Metrics\n";
    Object.entries(result.metrics).forEach(([k, v]) => {
      csv += `${k},${v}\n`;
    });

    // 📈 Equity Curve
    csv += "\nEquity Curve\nDate,Capital\n";
    result.equity_curve.forEach((e: any) => {
      csv += `${e.date},${e.capital}\n`;
    });

    // 📈 Allocation History
    csv += "\nAllocation History\nDate,CompanyID,Allocation\n";
    result.allocation_history.forEach((a: any) => {
      Object.entries(a.allocations).forEach(([companyId, value]) => {
        csv += `${a.date},${companyId},${value}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backtest_${result.backtest_id}.csv`;
    link.click();
  };

  if (!result) return null;

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={downloadJSON}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Download JSON
      </button>

      <button
        onClick={downloadCSV}
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        Download CSV
      </button>
    </div>
  );
}
