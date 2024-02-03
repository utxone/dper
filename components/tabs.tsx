"use client";
import { useState } from "react";
import ClaimRecord from "@/components/records";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
        className="mt-20 mb-6 text-love-500 cursor-pointer border border-love-500 bg-black rounded-full px-3   transition-all ease-in-out delay-150"
        onClick={changeTab}
        transition={{ type: "spring", duration: 0.8 }}
      >
        {tab === "txs" ? "What's op:depr?" : "Claim records"}
      </motion.div>
      {tab === "info" ? (
        <h2 className="w-full md:w-[800px] min-h-[400px] font-mono text-center leading-8 text-white">
          {`{op:depr}`} is a project to give the credit to brc-20 ticker deployers,
          there are more than 60000 tickers deployed, those ticker would not
          exist if there is no deployer. If you have deployed brc-20 ticker
          before block <span className="decoration">[819394]</span> , you can
          claim 1,000 depr, all depr is available to claim. {' '}
          <Link href="/rules" className="underline underline-offset-2">Learn more</Link> about the rules.
        </h2>
      ) : (
        <ClaimRecord></ClaimRecord>
      )}
    </>
  );
}
