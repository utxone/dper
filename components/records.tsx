"use client";
import { usePagination } from "@/lib/use-pagination";
import { Record } from "@prisma/client";
import { LoadMore } from "./load-more";
import { compactAddress, dateFromNow } from "@/lib/utils";
import { TESTNET } from "@/lib/constant";

export default function ClaimRecords() {
  const { records, setPage, isLoading, hasNext, hasPre, hasMore, total, page } =
    usePagination<Record>("/api/records");
  const txExplorerUrl = (txHash: string) => {
    return `https://mempool.space/${TESTNET ? "testnet/" : "/"}tx/${txHash}`;
  };
  const txOrdUrl = (ticker: string) => {
    return `https://${TESTNET ? "testnet." : ""}unisat.io/brc20/${ticker}`;
  };
  return (
    <>
      <div className="mt-20 text-xl text-love-500 cursor-pointer bg-black rounded-sm px-3 transition-all ease-in-out delay-150">
        [ records ]
      </div>
      <div className="relative records w-full md:w-[800px] min-h-[400px] py-4 text-stone-800 mt-2">
        <div className="flex flex-col space-y-4">
          {records &&
            records.map((record) => (
              <div className="font-mono px-4 pb-2 text-center" key={record.id}>
                <div className="break-words">
                  <span>
                    {`{"p":"brc-20","op":"dper","tick":"`}
                    <a
                      href={txOrdUrl(record.ticker)}
                      target="_blank"
                      className="text-orange-600"
                    >
                      {record.ticker}
                    </a>
                    {`","amt":"1000","tx":"`}
                  </span>
                  <a
                    href={txExplorerUrl(record.hash)}
                    target="_blank"
                    className="text-orange-600"
                  >
                    {compactAddress(record.hash)}
                  </a>
                  <span>{`"}`}</span>
                </div>
                {/* <span className="mt-4 text-sm text-stone-600">{dateFromNow(record.create_at)}</span> */}
              </div>
            ))}
          {isLoading &&
            !hasPre &&
            ["✨", "✨"].map((_, index) => (
              <div
                className="font-mono flex flex-row animate-pulse items-center justify-center"
                key={index}
              >
                <span className="mr-2">{`{`}</span>
                <div className="h-4 w-full md:w-[560px] rounded-md bg-orange-500/50"></div>
                <span className="ml-2">{`}`}</span>
              </div>
            ))}
        </div>
        {records.length > 0 && (
          <LoadMore
            isLoading={isLoading}
            hasNext={hasNext && hasMore}
            hasPre={hasPre}
            total={total}
            page={page}
            setPage={setPage}
            empty={records.length === 0}
          />
        )}
      </div>
    </>
  );
}
