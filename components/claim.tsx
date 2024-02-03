"use client";
import { claim, getTickDeployer } from "@/lib/claim";
import { calculateFee, compactAddress } from "@/lib/utils";
import { useAsyncEffect } from "ahooks";
import Image from "next/image";
import Confetti from "./confetti";
import EyeIcon from "./eye-icon";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Modal from "./modal";
import { TESTNET, HEIGHT } from "@/lib/constant";
import { Wallet } from "@/lib/use-wallet";

const WalletConnectModal = ({
  showConnectModal,
  setShowConnectModal,
}: {
  showConnectModal: boolean;
  setShowConnectModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const walletContext = useContext(Wallet);
  const connect = useCallback(async () => {
    const wallet = (window as any).unisat;
    if (!wallet) {
      return;
    }
    const accounts = await wallet.getAccounts();
    const network = await wallet.getNetwork();
    if (accounts && accounts.length > 0) {
      walletContext.dispatch!({
        type: "connect",
        payload: {
          address: accounts[0],
          network,
          wallet,
        },
      });
      return;
    }
  }, [walletContext.dispatch]);
  return (
    <Modal
      showModal={showConnectModal}
      setShowModal={setShowConnectModal}
      clickToClose={true}
      key="wallet-connect-modal"
    >
      <div className="p-4 py-8 w-full grid grid-cols-2 overflow-hidden bg-love-200 md:max-w-lg md:rounded-md md:shadow-xl">
        <button
          className="p-4 flex rounded-md flex-row space-x-2 h-full w-full hover:bg-love-300"
          onClick={connect}
        >
          <Image
            src="/logo_unisat.png"
            unoptimized
            height="30"
            width="30"
            alt="unisat"
          ></Image>
          <span className="text-2xl font-weight">Unisat</span>
        </button>
        <button
          className="cursor-not-allowed p-4 flex rounded-md flex-row space-x-2 h-full w-full"
          disabled
        >
          <Image
            src="/logo_xverse.png"
            unoptimized
            height="30"
            width="30"
            alt="unisat"
          ></Image>
          <span className="text-2xl font-weight">Xverse</span>
        </button>
      </div>
    </Modal>
  );
};

const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  ticker,
  signature,
}: {
  showConfirmModal: boolean;
  setShowConfirmModal: Dispatch<SetStateAction<boolean>>;
  ticker: string;
  signature: string | undefined;
}) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feeRate, setFeeRate] = useState(0);
  const [txHash, setTxHash] = useState("");
  const walletContext = useContext(Wallet);
  const address = walletContext.state.address;
  useEffect(() => {
    if (!showConfirmModal) {
      setErrorMsg("");
      setIsLoading(false);
      setTxHash("");
    }
  }, [showConfirmModal]);
  const totalFee = useMemo(() => {
    if (!address) {
      return {
        inscribeFee: 0,
        transferFee: 0,
        devFee: 0,
        total: 0,
      }
    }
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
      key="confirm-modal"
    >
      <Confetti />
      <div className="p-4 w-full overflow-hidden bg-love-200 md:max-w-lg md:rounded-md md:shadow-xl">
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
  const [signature, setSignature] = useState();
  const [ticker, setTicker] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const walletContext = useContext(Wallet);
  const account = walletContext.state.address;

  const claim = async () => {
    setErrorMsg("");
    setIsLoading(true);
    if (!ticker || Buffer.from(ticker, 'utf8').length !== 4) {
      setErrorMsg("This is not a valid brc-20 ticker");
      setIsLoading(false);
      return;
    }
    /// check account, if not exist, connect wallet first
    const account = walletContext.state.address;
    if (!account) {
      setShowConnectModal(true);
      setIsLoading(false);
      return;
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
      {account ? (
        <ConfirmModal
          showConfirmModal={showModal}
          setShowConfirmModal={function (value: SetStateAction<boolean>): void {
            setShowModal(value);
          }}
          ticker={ticker}
          signature={signature}
        />
      ) : (
        <WalletConnectModal
          showConnectModal={showConnectModal}
          setShowConnectModal={function (value: SetStateAction<boolean>): void {
            setShowConnectModal(value);
          }}
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
          className="text-white h-16 py-2 px-4 w-full md:w-[400px] tracking-widest border border-r-0 rounded-l-md bg-black border-love-400 focus:border-love-500 focus:outline-none focus:ring-orange-400 focus-visible:border-love-500  active:border-love-500"
        />
        <button
          className="h-16 w-40 rounded-r-md flex items-center justify-center bg-love-500 hover:bg-love-600 py-4 px-6"
          disabled={isLoading}
          onClick={claim}
        >
          {isLoading ? <span className="loader"></span> : <span>CLAIM</span>}
        </button>
      </div>
      {errorMsg ? (
        <div className="mt-2 text-red-600">{errorMsg}</div>
      ) : (
        <div className="mt-2 text-transparent">Air</div>
      )}
    </div>
  );
}
