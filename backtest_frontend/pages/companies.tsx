import { useEffect, useState } from "react";
import { niftyCompanies } from "../public/data/nifty50";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/Button";
import StockDetail from "@/components/StockDetail";

export default function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchSector, setSearchSector] = useState("");
  const [symbol, setSymbol] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveResult, setLiveResult] = useState<any | null>(null);

  // 🧩 Load static data initially
  useEffect(() => {
    setCompanies(niftyCompanies);
    setFilteredCompanies(niftyCompanies);
  }, []);

  // 🔍 Filter logic with fallback
  useEffect(() => {
    if (searchName.trim() === "" && searchSector.trim() === "") {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchName.toLowerCase()) &&
        c.sector.toLowerCase().includes(searchSector.toLowerCase())
    );

    if (filtered.length > 0) {
      setFilteredCompanies(filtered);
      setLiveResult(null);
    } else if (searchName.trim() !== "") {
      // fallback to live search via backend
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search/${encodeURIComponent(searchName)}`)
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data.error || !data.symbol) {
            setLiveResult(null);
            setFilteredCompanies([]);
          } else {
            // show as a single card result
            const dynamicCompany = {
              id: 9999, // temporary unique id
              name: data.name,
              symbol: data.symbol,
              sector: data.sector || "Unknown",
              fromAPI: true,
            };
            setLiveResult(dynamicCompany);
            setFilteredCompanies([dynamicCompany]);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [searchName, searchSector, companies]);

  // ✨ Slide animation
  const slideVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  };

  return (
    <div className="flex lg:mt-[4vw] relative overflow-hidden">
      {/* Left Side — Company List */}
      <div className="p-8 bg-[#f5ffe3] lg:min-h-screen overflow-y-auto w-[100vw] lg:w-[100vw] border-r">

        {/* 🔍 Search Fields */}
        <div className="flex flex-col lg:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name"
            className="border p-2 rounded-md outline-none w-full lg:w-2/12"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by sector"
            className="border p-2 rounded-md outline-none w-full lg:w-2/12"
            value={searchSector}
            onChange={(e) => setSearchSector(e.target.value)}
          />
        </div>

        {/* 💫 Loading state */}
        {loading && (
          <p className="text-sm text-gray-500 mb-2">Searching live...</p>
        )}

        {/* 🏢 Companies List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((c) => (
            <div
              key={c.id}
              className={`border hover:scale-105 bg-white transition-all duration-150 p-4 rounded shadow ${
                c.fromAPI ? "border-blue-400" : ""
              }`}
            >
              <h2 className="font-semibold lg:text-[1vw] roboto">
                {c.name}{" "}
                {c.fromAPI && (
                  <span className="text-xs text-blue-500">(Live Result)</span>
                )}
              </h2>
              <p className="content roboto">{c.symbol}</p>
              <p className="content roboto">{c.sector}</p>
              <div className="w-full flex justify-end">
                <button
                  onClick={() => {
                    setCompanyId(c.id);
                    setCompanyName(c.name);
                    setSymbol(c.symbol);
                  }}
                  className="text-blue-500 content-sm mt-2"
                >
                  <Button title="View Details" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offcanvas — Stock Details */}
      <AnimatePresence>
        {companyId && (
          <motion.div
            key="stock-detail"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-[80vw] lg:w-[60vw] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="flex justify-end items-center p-4 border-b">
              <button
                onClick={() => setCompanyId(null)}
                className="text-gray-500 hover:text-black text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <StockDetail symbol={symbol} name={companyName} id={companyId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay when open */}
      <AnimatePresence>
        {companyId && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCompanyId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
