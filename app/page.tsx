import { motion } from "framer-motion";
import Claim from "@/components/claim";
import About from "@/components/about";
import { urbanist } from "@/lib/fonts";
import ClaimRecord from "@/components/records";
import Tooltip from '@/components/tooltip';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 overflow-hidden relative">
      <h1
        className={`text-4xl md:text-6xl mt-32 md:mt-[20%] text-love-500 tracking-wider ${urbanist.className}`}
      >
        <span className="text-love-500">{"{"}</span>
        {` op:dper `}
        <span className="text-love-500">{"}"}</span>
      </h1>
      <Claim></Claim>
      <About></About>
      <ClaimRecord></ClaimRecord>

      <div className="mt-24 z-10 flex flex-row items-center space-x-4 text-xl bg-white text-love-500">
        [
        <a
          href="https://x.com/dper_xyz"
          target="_blank"
          className="decoration hover:underline underline-offset-4 cursor-pointer"
        >
          x,
        </a>
        <a
          href="https://t.me/+zRyFwy-RxJdmYjY1"
          target="_blank"
          className="decoration hover:underline underline-offset-4 cursor-pointer"
        >
          telegram,
        </a>
        <a
          href="https://github.com/utxo-labs/dper"
          target="_blank"
          className="decoration hover:underline underline-offset-4 cursor-pointer"
        >
         github,
        </a>
        <a
          href="https://unisat.io/brc20/dper"
          target="_blank"
          className="decoration hover:underline underline-offset-4"
        >
          dper,
        </a>
        <a
          id="tooltip"
          className="decoration hover:underline underline-offset-4"
        >
          donate
        </a>
        ]
        <Tooltip id="tooltip" />
      </div>
    </main>
  );
}
