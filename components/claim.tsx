"use client";

import { getTickDeployer } from "@/lib/claim";
import { compactAddress } from "@/lib/utils";
import { useAsyncEffect } from "ahooks";
import { log } from "console";
import { useState } from "react";

export default function Claim() {
  const [account, setAccount] = useState();
  const [ticker, setTicker] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const className =
    "my-32 flex items-center justify-center bg-orange-500 hover:bg-orange-700 py-4 px-6 text-xl md:text-2xl rounded-md";
  useAsyncEffect(async () => {
    const wallet = (window as any).unisat;
    if (!wallet) {
      return;
    }
    const accounts = await wallet.getAccounts();
    if (accounts && accounts.length > 0) {
      setAccount(accounts[0]);
      return;
    }
  }, []);

  const claim = async () => {
    setErrorMsg("");
    if (!ticker || ticker.length !== 4) {
      setErrorMsg("This is not a valid brc-20 ticker");
      return;
    }
    /// check account, if not exist, connect wallet first
    if (!account) {
      const wallet = (window as any).unisat;
      if (!wallet) {
        setErrorMsg("Unisat wallet not installed");
        return;
      }
      const accounts = await wallet.getAccounts();
      if (accounts && accounts.length > 0) {
        setAccount(() => accounts[0]);
      }
    }
    /// verify ticker and signature
    try {
      const token = await getTickDeployer(ticker);
      /// check block height
      if (token.deployHeight > 819394) {
        setErrorMsg(
          `Sorry, ${ticker} was deployed after block 819394`
        );
        return;
      }
      /// check creator
      if (token.creator !== account) {
        setErrorMsg(
          `${ticker} wad deployed by ${compactAddress(
            token.creator
          )}, please connect with that account.`
        );
        return;
      }
      /// get user signature
      const signature = await (window as any).unisat.signMessage(
        `{op:depr} ${ticker} deployer verification ${Date.now()}`
      );
      console.log(signature)
    } catch (error) {
      if (error instanceof Error) setErrorMsg(error.message);
    }
  };

  return (
    <div className="flex flex-col my-32 items-center">
      <div className="flex flex-row items-center text-xl md:text-2xl">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Ticker you deployed"
          className="h-20 py-2 px-4 tracking-widest	border-2 border-r-0 rounded-l-lg border-orange-400 dark:border-orange-600 focus:border-orange-500 focus:outline-none focus:ring-orange-400 focus-visible:border-orange-500  active:border-orange-500"
        />
        <button
          className="h-20 rounded-r-lg flex items-center justify-center bg-orange-500 hover:bg-orange-600 py-4 px-6"
          onClick={claim}
        >
          Claim
        </button>
      </div>
      {errorMsg && <div className="mt-2 text-red-600">{errorMsg}</div>}
    </div>
  );
}
