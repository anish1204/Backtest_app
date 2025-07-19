import Button from "@/components/Button";
// import '../styles/global.css'
import StockDetail from "@/components/StockDetail";
import { useEffect, useState } from "react";

export default function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId,setCompanyId] = useState<any>(null);

  useEffect(()=>{

  },[companyId])

  useEffect(() => {
    fetch("http://localhost:8000/companies/")
      .then(res => res.json())
      .then(setCompanies);
  }, []);

  return (
    <div className="flex lg:mt-[4vw]">
      <div className="p-8 bg-white lg:min-h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold  mb-4">Companies</h1>
        <div className="grid grid-cols-1 gap-4">
          {companies.map(c => (
            <div key={c.id} className="border p-4 lg:w-[25vw] content-sm  rounded shadow">
              <h2 className="font-semibold content-sm">{c.name}</h2>
              <p className="content-sm">{c.symbol}</p>
              <p>Sector: {c.sector}</p>
              <button 
              onClick={()=>{setCompanyId(c.id)}}
              // href={`/company/${c.id}`} 
              className="text-blue-500 content-sm lg:mt-[1vw]">View Details →</button>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:w-[80vw] sticky top-0 z-1 lg:mt-[4vw] flex justify-center items-center h-screen">
            <StockDetail id={companyId} />
      </div>
    </div>

  );
}
