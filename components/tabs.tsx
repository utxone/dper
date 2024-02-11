"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { HEIGHT } from "@/lib/constant";

export default function Tabs() {
  const [tab, setTab] = useState("txs");
  function changeTab() {
    if (tab === "info") {
      setTab("txs");
    } else {
      setTab("info");
    }
  }
  return (
    <>
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mt-48 text-xl text-love-500 cursor-pointer bg-black rounded-full px-3 transition-all ease-in-out delay-150"
      >
        [ about ]
      </motion.div>
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="px-2 py-4 rounded-md"
      >
        <h2 className="w-full md:w-[800px] font-mono text-center leading-8 text-white">
          {`{op:dper}`} initiative recognizes the contributions of brc-20
          deployers, over <span className="text-orange-600">[60,000]</span>{" "}
          unique tickers exist thanks to those deployers. If you have deployed
          brc-20 ticker before block{" "}
          <span className="text-orange-600">[{Number(HEIGHT).toLocaleString('en-US')}]</span>, you are eligible
          to claim <span className="text-orange-600">[1,000]</span> dper, the
          entire supply is available for eligible addresses!{" "}
        </h2>
      </motion.div>
    </>
  );
}
