import { motion } from "framer-motion";
import Claim from "@/components/claim";
import Tabs from "@/components/tabs";
import { urbanist } from "@/lib/fonts";
import { useState } from "react";
import Tooltip from '@/components/tooltip';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 overflow-hidden home relative">
      <h1
        className={`text-4xl md:text-6xl mt-32 md:mt-52 text-love-500 tracking-wider ${urbanist.className}`}
      >
        <span className="text-love-500">{"{"}</span>
        {`op:depr`}
        <span className="text-love-500">{"}"}</span>
      </h1>
      <Claim></Claim>
      <Tabs></Tabs>

      <div className="flex flex-row items-center space-x-4 text-xl text-love-500">
        <a
          href="https://t.me/+zRyFwy-RxJdmYjY1"
          target="_blank"
          className="decoration hover:underline underline-offset-4 cursor-pointer"
        >
          x
        </a>
        <a
          href="https://t.me/+zRyFwy-RxJdmYjY1"
          target="_blank"
          className="decoration hover:underline underline-offset-4 cursor-pointer"
        >
          telegram
        </a>
        <a
          href="https://unisat.io/brc20/depr"
          target="_blank"
          className="decoration hover:underline underline-offset-4"
        >
          depr
        </a>
        <a
          id="tooltip"
          className="decoration hover:underline underline-offset-4"
        >
          donate
        </a>
        <Tooltip id="tooltip" />
      </div>
    </main>
  );
}
