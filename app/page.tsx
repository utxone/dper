import ClaimButton from "@/components/claim_button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-orange-400">
      <h1 className="text-2xl md:text-4xl font-bold mt-32">{"{ op: depr }"}</h1>
      <h2 className="text-4xl md:text-6xl mt-20 text-center font-bold">
        Airdrop for brc-20 deployers, thank you!
      </h2>
      <h2 className="text-xl md:text-3xl text-center mt-10 font-bold">
        If you hold brc-20 deploy inscription which was deployed before block{" "}
        <span className="font-mono">
          819394, you can claim 1000 depr per inscription, all 21000000 depr is available to claim
        </span>{" "}
      </h2>
      <div className="mt-30"></div>
      <ClaimButton></ClaimButton>
      <div className="flex flex-row space-x-4 text-xl">
        <a
          href="https://unisat.io/brc20/depr"
          target="_blank"
          className="decoration underline underline-offset-4"
        >
          View on Unisat
        </a>
        <span className="decoration underline underline-offset-4 cursor-pointer">
          Donate
        </span>
        <a
          href=""
          target="_blank"
          className="decoration underline underline-offset-4 cursor-pointer"
        >
          Telegram
        </a>
      </div>
    </main>
  );
}
