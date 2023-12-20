"use client";
import { usePagination } from "@/lib/use-pagination";
import { Record } from "@prisma/client";
import { LoadMore } from "./load-more";
import { compactAddress, dateFromNow } from "@/lib/utils";
import { TESTNET } from "@/lib/constant";

export default function ClaimRecords() {
  const { records, setPage, isLoading, hasMore } =
    usePagination<Record>("/api/records");
  const txExplorerUrl = (txHash: string) => {
    return `https://mempool.space/${TESTNET ? "testnet/" : "/"}tx/${txHash}`;
  };

  return (
    <>
      <div className="mt-6 w-full">
        <div className="flex flex-col">
          {records &&
            records.map((record) => (
              <>
                <div className="font-mono px-4 pb-2 text-center">
                  <div className="break-words">
                    <span>
                      {`{"op":"depr","tick":"${record.ticker}","amt":"1000","tx":"`}
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
              </>
            ))}
          {isLoading &&
            ["✨", "✨"].map((_, index) => (
              <>
                <div
                  className="font-mono flex flex-row animate-pulse items-center justify-center"
                  key={index}
                >
                  <span className="mr-2">{`{`}</span>
                  <div className="h-4 w-full md:w-60 rounded-md bg-orange-500/50"></div>
                  <span className="ml-2">{`}`}</span>
                </div>
              </>
            ))}
        </div>
        {records.length > 0 && (
          <LoadMore
            isLoading={isLoading}
            hasMore={hasMore}
            setPage={setPage}
            empty={records.length === 0}
          />
        )}
      </div>
    </>
  );
}
