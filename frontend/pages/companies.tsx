import { useEffect, useState } from "react";

export default function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/companies/")
      .then(res => res.json())
      .then(setCompanies);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      <div className="grid grid-cols-2 gap-4">
        {companies.map(c => (
          <div key={c.id} className="border p-4  rounded shadow">
            <h2 className="font-semibold">{c.name}</h2>
            <p>{c.symbol}</p>
            <p>Sector: {c.sector}</p>
            <a href={`/company/${c.id}`} className="text-blue-500">View Details →</a>
          </div>
        ))}
      </div>
    </div>
  );
}
