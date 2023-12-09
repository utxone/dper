import ClaimButton from "@/components/claim_button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gradient-to-tr from-orange-100 to-orange-200">
      <h1 className="text-2xl md:text-4xl font-bold mt-32">
        <span className="text-orange-500">{"{"}</span>{" "} op: depr{" "}<span className="text-orange-500">{"}"}</span>
      </h1>
      <h2 className="text-4xl md:text-6xl mt-20 text-center font-bold">
        Airdrop for brc-20 deployers, thank you!
      </h2>
      <h2 className="text-xl md:text-3xl text-center mt-10 font-bold">
        If you hold brc-20 deploy inscription which was deployed before block{" "}
        <span className="font-mono decoration">[819394]</span> , you can claim
        1,000 depr per inscription, all 21,000,000 depr is available to claim.
      </h2>
      <div className="mt-30"></div>
      <ClaimButton></ClaimButton>
      <div className="flex flex-row space-x-4 text-xl">
        <a
          href="https://unisat.io/brc20/depr"
          target="_blank"
          className="decoration underline underline-offset-4"
        >
          DEPR
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
