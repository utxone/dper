"use client";
import { Wallet } from "@/lib/use-wallet";
import { compactAddress } from "@/lib/utils";
import { SetStateAction, useContext, useState } from "react";
import WalletConnectModal from "./wallet-connect-modal";
import Link from "next/link";

export default function Header() {
  const walletContext = useContext(Wallet);
  const address = walletContext.state.address;
  const [showConnectModal, setShowConnectModal] = useState(false);
  return (
    <>
      {!address && (
        <WalletConnectModal
          showConnectModal={showConnectModal}
          setShowConnectModal={function (value: SetStateAction<boolean>): void {
            setShowConnectModal(value);
          }}
        />
      )}
      <div
        className="fixed top-0 py-4 px-4 md:px-8 w-full flex flex-row justify-between text-stone-800 backdrop-blur-md home"
        style={{ "zIndex": 10 }}
      >
        <Link href="/">
          <svg
            className="w-8 md:w-12 h-8 md:h-12"
            viewBox="0 0 350 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M167 75C111.772 75 67 119.772 67 175C67 230.228 111.772 275 167 275V75Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M153.667 89.3526C112.132 95.766 80.3333 131.67 80.3333 175C80.3333 218.33 112.132 254.234 153.667 260.647V89.3526ZM153.667 75.8811C104.742 82.3997 67 124.292 67 175C67 225.708 104.742 267.6 153.667 274.119C158.028 274.7 162.479 275 167 275V75C162.479 75 158.028 75.3 153.667 75.8811Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M185 75C240.228 75 285 119.772 285 175C285 230.228 240.228 275 185 275V75Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M198.333 89.3526C239.868 95.766 271.667 131.67 271.667 175C271.667 218.33 239.868 254.234 198.333 260.647V89.3526ZM198.333 75.8811C247.258 82.3997 285 124.292 285 175C285 225.708 247.258 267.6 198.333 274.119C193.972 274.7 189.521 275 185 275V75C189.521 75 193.972 75.3 198.333 75.8811Z"
              fill="currentColor"
            />
            <path d="M157 265.5L157 4" stroke="currentColor" strokeWidth="20" />
            <path
              d="M195 341L195 82.5"
              stroke="currentColor"
              strokeWidth="20"
            />
            <circle
              cx="175"
              cy="175"
              r="165"
              stroke="currentColor"
              strokeWidth="20"
            />
          </svg>
        </Link>
        {address ? (
          <span className=" text-stone-800 text-xl font-mono">
            {compactAddress(address)}
          </span>
        ) : (
          <button
            className="text-stone-300 rounded-md flex items-center justify-center border bg-black border-love-500 hover:border-love-600 py-2 px-4 z-50"
            onClick={() => {
              setShowConnectModal(true);
            }}
          >
            CONNECT
          </button>
        )}
      </div>
    </>
  );
}
