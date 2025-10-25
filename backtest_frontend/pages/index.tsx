"use client";

import Button from "@/components/Button";
import Link from "next/link";
import React from "react";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0b0f19] via-[#141a29] to-[#1e1b3a] flex flex-col justify-center items-center text-center relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-[#6a5acd]/20 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#00e6e6]/10 blur-[120px] rounded-full z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 px-6 lg:px-0 flex flex-col items-center gap-6">
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-wide text-white">
          <span className="text-[#a78bfa]">Trade</span>
          <span className="text-[#6a5acd]">Mo</span>
        </h1>

        <p className="text-gray-400 text-sm lg:text-lg max-w-xl leading-relaxed">
          The all-in-one platform for investors and fund managers to{" "}
          <span className="text-[#a78bfa] font-medium">analyze</span>,{" "}
          <span className="text-[#00e6e6] font-medium">track</span>, and{" "}
          <span className="text-[#ff6ec7] font-medium">backtest</span> their
          trading strategies — all in real time.
        </p>

        <div className="mt-6">
          <Link href="/companies">
            <button className="bg-gradient-to-r from-[#6a5acd] to-[#805ad5] px-8 py-3 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-[#6a5acd]/50 hover:scale-105 transition-all">
              Start Testing 🚀
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Line */}
      <div className="absolute bottom-6 text-gray-500 text-xs tracking-wide">
        © {new Date().getFullYear()} TradeMo · Empowering Smarter Investing
      </div>
    </div>
  );
};

export default Index;
