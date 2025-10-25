"use client";
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

  useEffect(() => {
    setCompanies(niftyCompanies);
    setFilteredCompanies(niftyCompanies);
  }, []);

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
    } else if (searchName.trim() !== "") {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search/${encodeURIComponent(searchName)}`)
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data.error || !data.symbol) {
            setFilteredCompanies([]);
          } else {
            const dynamicCompany = {
              id: 9999,
              name: data.name,
              symbol: data.symbol,
              sector: data.sector || "Unknown",
              fromAPI: true,
            };
            setFilteredCompanies([dynamicCompany]);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [searchName, searchSector, companies]);

  const slideVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#141a29] to-[#1e1b3a] text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-[#6a5acd]/20 blur-[180px] rounded-full -translate-x-1/2 z-0"></div>

      <div className="relative z-10 p-6 lg:p-10">
        {/* Page Title */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl lg:mt-[3rem] lg:text-4xl font-bold text-[#a78bfa] tracking-wide">
            Explore NIFTY 50 Companies
          </h1>
          <p className="text-gray-400 mt-2 text-sm lg:text-base max-w-2xl">
            Analyze, track and test investment strategies with real-time company data and market metrics.
          </p>
        </div>

        {/* Search Panel */}
        <div className="flex flex-col lg:flex-row gap-3 mb-10 bg-[#101524]/60 border border-[#23283d] backdrop-blur-xl rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 w-full lg:w-1/3 bg-[#141a29] border border-[#23283d] px-4 py-2 rounded-lg">
            <span className="text-[#6a5acd]">🔍</span>
            <input
              type="text"
              placeholder="Search by name"
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full lg:w-1/3 bg-[#141a29] border border-[#23283d] px-4 py-2 rounded-lg">
            <span className="text-[#00e6e6]">🏢</span>
            <input
              type="text"
              placeholder="Search by sector"
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
              value={searchSector}
              onChange={(e) => setSearchSector(e.target.value)}
            />
          </div>
          {loading && (
            <p className="text-sm text-gray-400 self-center">Searching live...</p>
          )}
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`relative p-5 rounded-2xl bg-[#141a29]/80 backdrop-blur border border-[#23283d] hover:border-[#6a5acd] shadow-md hover:shadow-[#6a5acd]/40 transition-all duration-300`}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h2 className="font-semibold text-lg mb-1 text-white flex items-center gap-2">
                    {c.name}
                    {c.fromAPI && (
                      <span className="text-xs text-[#6a5acd]">(Live)</span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-400">{c.symbol}</p>
                  <p className="text-sm text-gray-500 mb-4">{c.sector}</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setCompanyId(c.id);
                      setCompanyName(c.name);
                      setSymbol(c.symbol);
                    }}
                    className="bg-gradient-to-r from-[#6a5acd] to-[#805ad5] px-4 py-2 rounded-lg text-white text-sm font-medium shadow-md hover:shadow-[#6a5acd]/50 hover:scale-105 transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stock Details Drawer */}
      <AnimatePresence>
        {companyId && (
          <motion.div
            key="stock-detail"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-[85vw] lg:w-[60vw] bg-[#101524] text-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-[#6a5acd]">{companyName}</h2>
              <button
                onClick={() => setCompanyId(null)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
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

      {/* Overlay */}
      <AnimatePresence>
        {companyId && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
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
