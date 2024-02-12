import { HEIGHT } from "@/lib/constant";

export default function About() {
  return (
    <>
      <div
        className="mt-48 text-xl text-love-500 cursor-pointer bg-black rounded-full px-3 transition-all ease-in-out delay-150"
      >
        [ about ]
      </div>
      <div
        className="px-2 py-4 rounded-md"
      >
        <h2 className="w-full md:w-[800px] font-mono leading-8 text-white text-center text-pretty">
          {`{op:dper}`} initiative recognizes the contributions of brc-20
          deployers, over <span className="text-orange-600">[60,000]</span>{" "}
          unique tickers exist thanks to those deployers. If you have deployed
          brc-20 ticker before block{" "}
          <span className="text-orange-600">[{Number(HEIGHT).toLocaleString('en-US')}]</span>, you are eligible
          to claim <span className="text-orange-600">[1,000]</span> dper, the
          entire supply is available for eligible addresses!{" "}
        </h2>
      </div>
    </>
  );
}
