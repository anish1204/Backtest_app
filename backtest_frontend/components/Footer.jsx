"use client";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0b0f19] via-[#141a29] to-[#1e1b3a] border-t border-[#23283d] text-gray-300">
      <div className="max-w-7xl mx-auto py-10 px-6 lg:px-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
        {/* Left Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-wide text-white">
            <span className="text-[#a78bfa]">Trade</span>
            <span className="text-[#6a5acd]">Mo</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-md">
            Empowering traders and fund managers to{" "}
            <span className="text-[#00e6e6] font-medium">analyze</span>,{" "}
            <span className="text-[#a78bfa] font-medium">test</span>, and{" "}
            <span className="text-[#ff6ec7] font-medium">refine</span> their
            trading strategies in real-time.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            📞 Connect with us: <span className="text-[#a78bfa]">+91 8355995075</span>
          </p>
        </div>

        {/* Right Section - Newsletter */}
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <p className="font-semibold text-gray-200 text-sm tracking-wide">
            📧 Stay Updated
          </p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Your Email Address"
              className="bg-[#101524] border border-[#23283d] text-white text-sm rounded-lg px-4 py-2 w-full lg:w-72 focus:ring-2 focus:ring-[#6a5acd] outline-none placeholder:text-gray-500"
            />
            <button className="bg-gradient-to-r from-[#6a5acd] to-[#805ad5] px-4 py-2 rounded-lg text-white font-medium shadow hover:scale-105 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#23283d]/70 mt-6"></div>

      {/* Bottom Bar */}
      <div className="text-center text-xs text-gray-500 py-5">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#a78bfa] font-semibold">TradeMo</span>. All rights
        reserved · Built for smarter investing.
      </div>
    </footer>
  );
};

export default Footer;
