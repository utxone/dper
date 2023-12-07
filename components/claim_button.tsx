"use client";

import { useAsyncEffect } from "ahooks";
import { useEffect, useState } from "react";

export default function ClaimButton() {
  const [status, setStatus] = useState("disconnected");
  const [account, setAccount] = useState();
  const className =
    "my-32 flex items-center justify-center bg-orange-500 hover:bg-orange-700 font-bold py-4 px-6 text-xl md:text-2xl rounded-md";
  useAsyncEffect(async () => {
    const wallet = (window as any).unisat;
    if (!wallet) {
      setStatus("not_installed");
      return;
    }
    const accounts = await wallet.getAccounts();
    if (accounts) {
      setStatus("connected");
      setAccount(accounts[0]);
      return;
    }
    setStatus("disconnected");
  }, []);
  if (status === "not_installed")
    return (
      <button
        className={className}
        onClick={() => {
          window.open("https://unisat.io", "_blank");
        }}
      >
        Please install unisat wallet to claim airdrop
      </button>
    );
  if (status === "disconnected")
    return (
      <button
        className={className}
        onClick={async () => {
          const account = await (window as any).unisat.requetAccount();
        }}
      >
        Connect
      </button>
    );
  if (status === "connected")
    return <button className={className}>{account}</button>;
}
