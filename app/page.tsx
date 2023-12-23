import { motion } from "framer-motion";
import Claim from "@/components/claim";
import ClaimRecord from "@/components/records";
import { martian } from "@/lib/fonts";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gradient-to-tr from-orange-100 to-orange-200">
      <h1
        className={`text-4xl md:text-4xl font-bold mt-32 font-mono text-orange-500 ${martian.className}`}
      >
        <span className="text-orange-500">{"{"}</span>op:depr
        <span className="text-orange-500">{"}"}</span>
      </h1>
      <h2 className="text-4xl md:text-6xl mt-20 text-center font-[500] text-neutral-800">
        Airdrop for brc-20 deployers
      </h2>
      <h2 className="text-xl md:text-3xl text-center mt-10 font-[500] text-neutral-800">
        If you have deployed brc-20 ticker before block{" "}
        <span className="font-mono decoration">[819394]</span> , you can claim
        1,000 depr, all 20,000,000 depr is available to claim.
      </h2>
      <div className="mt-30"></div>
      <Claim></Claim>
      <ClaimRecord></ClaimRecord>
      
      <div className="mt-32 flex flex-row space-x-4 text-xl text-orange-500">
        <a
          href="https://unisat.io/brc20/depr"
          target="_blank"
          className="decoration underline underline-offset-4"
        >
          depr
        </a>
        <a
          href="https://t.me/+zRyFwy-RxJdmYjY1"
          target="_blank"
          className="decoration underline underline-offset-4 cursor-pointer"
        >
          telegram
        </a>
      </div>
      <span className="mt-2 text-stone-600 break-all text-center">
        DONATE: {process.env.NEXT_PUBLIC_DONATE_ADDRESS}
      </span>
    </main>
  );
}
