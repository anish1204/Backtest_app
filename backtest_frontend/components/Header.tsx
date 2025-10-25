"use client";
import Link from "next/link";
import React, { useState } from "react";
import Button from "./Button";

const Header = () => {
  const urls = [
    { url: "/companies", title: "Companies" },
    { url: "/strategies", title: "Strategy" },
    { url: "/backtest", title: "BackTest" },
  ];

  const [authenticated, setAuthenticated] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-gradient-to-r from-[#0b0f19]/95 via-[#141a29]/90 to-[#1e1b3a]/95 border-b border-[#23283d] shadow-lg">
      <div className="mx-auto flex items-center justify-between lg:px-[2.3vw] px-2 py-3">
        {/* 🧿 Logo */}
        <Link href="/" className="text-2xl font-bold text-white tracking-wide">
          <span className="text-[#a78bfa]">Trade</span>
          <span className="text-[#6a5acd]">Mo</span>
        </Link>

        {/* 🧭 Navigation */}
        {authenticated ? (
          <div className="flex items-center space-x-8">
            {urls.map((item, i) => (
              <Link
                key={i}
                href={item.url}
                className="relative text-gray-300 hover:text-white transition-all duration-200 text-sm lg:text-base group"
              >
                {item.title}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#6a5acd] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => setAuthenticated(false)}
              className="px-4 py-2 rounded-md bg-[#1f1f3d] text-sm text-gray-300 hover:text-white hover:bg-[#6a5acd]/30 transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <button className="bg-gradient-to-r from-[#6a5acd] to-[#805ad5] px-5 py-2 rounded-lg text-white font-medium shadow hover:shadow-[#6a5acd]/50 hover:scale-105 transition-all">
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
