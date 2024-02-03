"use client";
import { claim, getTickDeployer } from "@/lib/claim";
import { calculateFee, compactAddress } from "@/lib/utils";
import { useAsyncEffect } from "ahooks";
import Confetti from "./confetti";
import EyeIcon from "./eye-icon";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Modal from "./modal";
import { TESTNET, HEIGHT } from "@/lib/constant";

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
  address: string;
}) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feeRate, setFeeRate] = useState(0);
  const [txHash, setTxHash] = useState("");
  useEffect(() => {
    if (!showConfirmModal) {
      setErrorMsg("");
      setIsLoading(false);
      setTxHash("");
    }
  }, [showConfirmModal]);
  const totalFee = useMemo(() => {
    return calculateFee({ feeRate, address });
  }, [address, feeRate]);
  useAsyncEffect(async () => {
    const res = await fetch(
      `https://mempool.space/${
        TESTNET ? "testnet/" : ""
      }api/v1/fees/recommended`
    );
    const feeSummary = await res.json();
    const feeRate = feeSummary.halfHourFee;
    setFeeRate(feeRate);
  }, [showConfirmModal]);
  const confirm = useCallback(
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
          amount: totalFee.total,
          pubkey,
          feeRate,
        });
        setTxHash(txHash);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMsg(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [address, feeRate, signature, ticker, totalFee]
  );
  const txExplorerUrl = useMemo(() => {
    return `https://mempool.space/${TESTNET ? "testnet/" : "/"}tx/${txHash}`;
  }, [txHash]);
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
            <span>{totalFee.inscribeFee} sats</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>Transfer send fee</span>
            <span>{totalFee.transferFee} sats</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>Dev fee</span>
            <span>{totalFee.devFee} sats</span>
          </div>
          <div className="flex flex-row justify-between">
            <span className="font-bold">Total fee</span>
            <span>{totalFee.total} sats</span>
          </div>
        </div>

        <div className="my-4 px-6 flex flex-col items-center justify-center">
          {txHash ? (
            <div className="flex flex-col items-center">
              <span className="text-orange-500">
                Claim successfully! Please check your wallet shortly.{" "}
              </span>
              <a
                href={txExplorerUrl}
                target="_blank"
                className="text-sm text-[#1bd8f4] flex flex-row items-center space-x-1"
              >
                <EyeIcon />
                <span className="underline ">View on Mempool</span>
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
          {errorMsg && <div className="mt-2 text-red-600">{errorMsg}</div>}
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
      setSignature(signature);
      const token = await getTickDeployer(ticker);
      /// check token
      if (token.claimed) {
        setIsLoading(false);
        setErrorMsg(`Sorry, ${ticker} has been claimed`);
        return;
      }
      /// check block height
      if (token.deployHeight > HEIGHT) {
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
      setTicker(undefined)
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
    <div className="flex flex-col mt-10 items-center">
      {account && (
        <ConfirmModal
          showConfirmModal={showModal}
          setShowConfirmModal={function (value: SetStateAction<boolean>): void {
            setShowModal(value);
          }}
          ticker={ticker}
          signature={signature}
          address={account}
        />
      )}
      <div className="flex flex-row items-center text-xl md:text-2xl">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="ordi"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              claim();
            }
          }}
          className="text-white h-20 py-2 px-4 w-full md:w-[400px] tracking-widest border border-r-0 rounded-l-md bg-black border-love-400 focus:border-love-500 focus:outline-none focus:ring-orange-400 focus-visible:border-love-500  active:border-love-500"
        />
        <button
          className="h-20 w-40 rounded-r-md flex items-center justify-center bg-love-500 hover:bg-love-600 py-4 px-6"
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
