"use client";

import { claim, getTickDeployer } from "@/lib/claim";
import { calculateFee, compactAddress } from "@/lib/utils";
import { useAsyncEffect } from "ahooks";
import Confetti from "./confetti";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import Modal from "./modal";
import { blockHeight } from "@/lib/constant";

const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  ticker,
  signature,
  address,
}: {
  showConfirmModal: boolean;
  setShowConfirmModal: Dispatch<SetStateAction<boolean>>;
  ticker: string;
  signature: string | undefined;
  address: string | undefined;
}) => {
  const testnet = true;
  const [isLoading, setIsLoading] = useState(false);
  const [feeRate, setFeeRate] = useState(0);
  const [txHash, setTxHash] = useState("");
  const totalFee = useMemo(() => {
    return calculateFee({ feeRate });
  }, [feeRate]);
  useAsyncEffect(async () => {
    const res = await fetch(
      `https://mempool.space/${
        testnet ? "testnet/" : ""
      }api/v1/fees/recommended`
    );
    const feeSummary = await res.json();
    const feeRate = feeSummary.halfHourFee;
    setFeeRate(feeRate);
  });
  async function confirm() {
    if (!address || !signature || feeRate === 0) {
      return;
    }
    setIsLoading(true);
    const pubkey = await (window as any).unisat.getPublicKey();
    try {
      const txHash = await claim({
        ticker,
        address,
        signature,
        amount: totalFee,
        pubkey,
        testnet: true,
      });
      setTxHash(txHash);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    } finally {
      setIsLoading(false);
    }
  }
  const txExplorerUrl = useMemo(() => {
    return `https://https://mempool.space/${
      testnet ? "testnet/" : "/"
    }tx/${txHash}`;
  }, [testnet, txHash]);
  return (
    <Modal
      showModal={showConfirmModal}
      setShowModal={setShowConfirmModal}
      clickToClose={true}
    >
      <Confetti />
      <div className="p-4 w-full overflow-hidden bg-white dark:bg-stone-900 md:max-w-lg md:rounded-md md:shadow-xl">
        <div className="text-orange-400 px-6 pt-4 text-2xl font-semibold text-center">
          {`Dear ${ticker} deployer, thanks for your contribution!`}
        </div>
        <div className="px-8 my-8 flex flex-col space-y-2 w-full">
          <div className="flex flex-row justify-between">
            <span>FeeRate</span>
            <span>{feeRate} sats/vB</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>Transfer inscribe fee</span>
            <span>{calculateFee({ feeRate })} sats</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>Transfer send fee</span>
            <span>{feeRate * 100} sats</span>
          </div>
          <div className="flex flex-row justify-between">
            <span className="font-bold">Total fee</span>
            <span>{calculateFee({ feeRate })} sats</span>
          </div>
        </div>

        <div className="my-4 px-6 flex flex-row items-center justify-center">
          {txHash ? (
            <div className="flex flex-col items-center">
              <span className="text-orange-500">
                Claim successfully! Please check your wallet.{" "}
              </span>
              <a href={txExplorerUrl} target="_blank">
                View on mempool
              </a>
            </div>
          ) : (
            <button
              className="h-16 w-60 text-xl md:text-2xl rounded-lg flex items-center justify-center bg-orange-500 hover:bg-orange-600 py-4 px-6"
              disabled={isLoading}
              onClick={() => {
                confirm();
              }}
            >
              {isLoading ? (
                <span className="loader scale-50"></span>
              ) : (
                <span>Claim 1000 depr</span>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default function Claim() {
  const [account, setAccount] = useState();
  const [signature, setSignature] = useState();
  const [ticker, setTicker] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    setIsLoading(true);
    if (!ticker || ticker.length !== 4) {
      setErrorMsg("This is not a valid brc-20 ticker");
      setIsLoading(false);
      return;
    }
    /// check account, if not exist, connect wallet first
    const wallet = (window as any).unisat;
    if (!wallet) {
      setErrorMsg("Unisat wallet not installed");
      setIsLoading(false);
      return;
    }
    const accounts = await wallet.getAccounts();
    const pubkey = await wallet.getPublicKey();
    if (accounts && accounts.length > 0) {
      setAccount(() => accounts[0]);
    }
    /// get user signature
    /// verify ticker and signature
    try {
      const signature = await (window as any).unisat.signMessage(
        `{op:depr} ${ticker} deployer verification`
      );
      console.log(signature, `{op:depr} ${ticker} deployer verification`);
      setSignature(signature);
      const token = await getTickDeployer(ticker);
      console.log(token);
      /// check token
      if (token.claimed) {
        setIsLoading(false);
        setErrorMsg(`Sorry, ${ticker} has been claimed`);
        return;
      }
      /// check block height
      if (token.deployHeight > blockHeight) {
        setIsLoading(false);
        setErrorMsg(`Sorry, ${ticker} was deployed after block 819394`);
        return;
      }
      /// check creator
      if (token.creator !== account) {
        setIsLoading(false);
        setErrorMsg(
          `${ticker} wad deployed by ${compactAddress(
            token.creator
          )}, please connect with that account.`
        );
        return;
      }
      setIsLoading(false);
      /// open confirm modal
      setShowModal(true);
    } catch (error) {
      if (error instanceof Error) {
        setIsLoading(false);
        setErrorMsg(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col my-32 items-center">
      <ConfirmModal
        showConfirmModal={showModal}
        setShowConfirmModal={function (value: SetStateAction<boolean>): void {
          setShowModal(value);
        }}
        ticker={ticker}
        signature={signature}
        address={account}
      />
      <div className="flex flex-row items-center text-xl md:text-2xl">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Ticker you deployed"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              claim();
            }
          }}
          className="h-20 py-2 px-4 tracking-widest	border-2 border-r-0 rounded-l-lg border-orange-400 dark:border-orange-600 focus:border-orange-500 focus:outline-none focus:ring-orange-400 focus-visible:border-orange-500  active:border-orange-500"
        />
        <button
          className="h-20 w-40 rounded-r-lg flex items-center justify-center bg-orange-500 hover:bg-orange-600 py-4 px-6"
          disabled={isLoading}
          onClick={claim}
        >
          {isLoading ? <span className="loader"></span> : <span>CLAIM</span>}
        </button>
      </div>
      {errorMsg && <div className="mt-2 text-red-600">{errorMsg}</div>}
    </div>
  );
}