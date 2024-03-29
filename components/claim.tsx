"use client";
import { claim, getTickDeployer } from "@/lib/claim";
import { calculateFee, compactAddress } from "@/lib/utils";
import { useAsyncEffect } from "ahooks";
import { Verifier } from "bip322-js";
import { RECEIVER } from "@/lib/constant";
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
import WalletConnectModal from "./wallet-connect-modal";
import { sendBtcTransaction, signMessage } from "sats-connect";
import Popover from "./popover";
import DropdownIcon from "./dropdown-icon";

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
  const [openPopover, setOpenPopover] = useState(false);
  const [feeSummary, setFeeSummary] = useState([]);
  const [price, setPrice] = useState(0);
  const walletContext = useContext(Wallet);
  const address = walletContext.state.address;
  const pubkey = walletContext.state.pubkey;

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
      };
    }
    return calculateFee({ feeRate, address });
  }, [address, feeRate]);
  const totalUsd = useMemo(() => {
    if (!totalFee.total || !price) return 0;
    console.log(price);
    return (
      Math.floor((totalFee.total * price) / 10 ** 6) / 100
    ).toLocaleString("en-US");
  }, [price, totalFee.total]);
  useAsyncEffect(async () => {
    const res = await fetch(
      `https://mempool.space/${
        TESTNET ? "testnet/" : ""
      }api/v1/fees/recommended`
    );
    const priceRes = await fetch("https://mempool.space/api/v1/prices");
    const price = await priceRes.json();
    const feeSummary = await res.json();
    setPrice(price.USD);
    setFeeSummary(Object.values(feeSummary));
    const feeRate = feeSummary.halfHourFee;
    setFeeRate(feeRate);
  }, [showConfirmModal]);
  const confirm = useCallback(
    async function confirm() {
      if (!address || !signature || feeRate === 0 || !pubkey) {
        return;
      }
      setIsLoading(true);
      try {
        const amount = totalFee.total;
        let txid;
        if (walletContext.state.label === "unisat") {
          txid = await walletContext.state.wallet.sendBitcoin(RECEIVER, amount);
        } else {
          const payment = walletContext.state.payment;
          txid = await new Promise((resolve, reject) => {
            const sendBtcOptions = {
              payload: {
                network: {
                  type: TESTNET ? "Testnet" : "Mainnet",
                },
                recipients: [
                  {
                    address: RECEIVER,
                    amountSats: BigInt(amount),
                  },
                ],
                senderAddress: payment!,
              },
              onFinish: (response: any) => {
                resolve(response);
              },
              onCancel: () => {
                reject("Uer reject");
              },
            };
            // @ts-ignore
            sendBtcTransaction(sendBtcOptions);
          });
        }
        const txHash = await claim({
          ticker,
          address,
          signature,
          pubkey,
          feeRate,
          txid,
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
      <div className="relative p-4 mx-4 w-full glow grid grid-cols-1 overflow-hidden md:max-w-lg rounded-lg">
        <div className="text-orange-600 px-6 pt-4 text-2xl font-semibold text-center">
          {`Dear ${ticker} deployer, thanks for your contribution!`}
        </div>
        <div className="px-8 my-8 flex flex-col space-y-2 w-full">
          <div className="w-full flex flex-row justify-between">
            <span>Fee rate</span>
            <Popover
              content={
                <>
                  <div className="w-full rounded-md bg-love-100 p-1 sm:w-40">
                    <button
                      className="relative flex w-full items-center justify-between space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-love-400"
                      onClick={(event) => {
                        setFeeRate(feeSummary[0]);
                        setOpenPopover(false);
                      }}
                    >
                      <span>Fast</span>
                      <p className="text-sm">{feeSummary[0]} sats/vB</p>
                    </button>
                  </div>
                  <div className="w-full rounded-md bg-love-100 p-1 sm:w-40">
                    <button
                      className="relative flex w-full items-center justify-between space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-love-400"
                      onClick={() => {
                        setFeeRate(feeSummary[1]);
                        setOpenPopover(false);
                      }}
                    >
                      <span>Average</span>
                      <p className="text-sm">{feeSummary[1]} sats/vB</p>
                    </button>
                  </div>
                  <div className="w-full rounded-md bg-love-100 p-1 sm:w-40">
                    <button
                      className="relative flex w-full items-center justify-between space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-love-400"
                      onClick={() => {
                        setFeeRate(feeSummary[2]);
                        setOpenPopover(false);
                      }}
                    >
                      <span>Slow</span>
                      <p className="text-sm">{feeSummary[2]} sats/vB</p>
                    </button>
                  </div>
                </>
              }
              align="end"
              setOpenPopover={setOpenPopover}
              openPopover={openPopover}
            >
              <div
                onClick={() => setOpenPopover(!openPopover)}
                className="flex cursor-pointer flex-row items-center justify-center overflow-hidden border-none transition-all duration-75 focus:border-none focus:outline-none"
              >
                <span>
                  {feeRate} sats/vB
                  <DropdownIcon className="inline" />
                </span>
              </div>
            </Popover>
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
            <span>
              {totalFee.total} sats [~{totalUsd} $]
            </span>
          </div>
        </div>

        <div className="my-4 px-6 flex flex-col items-center justify-center">
          {txHash ? (
            <div className="flex flex-col items-center">
              <span className="text-orange-700 text-center">
                Claim successfully! Please check your wallet shortly.{" "}
              </span>
              <a
                href={txExplorerUrl}
                target="_blank"
                className="text-black text-sm flex flex-row items-center space-x-1"
              >
                <EyeIcon />
                <span className="underline ">View on Mempool</span>
              </a>
            </div>
          ) : (
            <button
              className="h-16 w-60 text-xl md:text-2xl rounded-lg flex items-center justify-center bg-love-500 hover:bg-love-600 py-4 px-6"
              disabled={isLoading}
              onClick={() => {
                confirm();
              }}
            >
              {isLoading ? (
                <span className="loader scale-50"></span>
              ) : (
                <span>Claim 1000 dper</span>
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
    if (!ticker || Buffer.from(ticker, "utf8").length !== 4) {
      setErrorMsg("Please enter a valid brc-20 ticker");
      setIsLoading(false);
      return;
    }
    /// check account, if not exist, connect wallet first
    const account = walletContext.state.address;
    const label = walletContext.state.label;
    if (!account) {
      setShowConnectModal(true);
      setIsLoading(false);
      return;
    }
    /// get user signature
    /// verify ticker and signature
    try {
      const message = `{op:dper} ${ticker} deployer verification`;
      let signature;
      if (label === "unisat") {
        signature = await (window as any).unisat.signMessage(
          `{op:dper} ${ticker} deployer verification`,
          "bip322-simple"
        );
      } else {
        signature = await new Promise((resolve, reject) => {
          const signMessageOptions = {
            payload: {
              network: {
                type: "Testnet",
              },
              address: walletContext.state.address,
              message,
            },
            onFinish: (response: any) => {
              resolve(response);
            },
            onCancel: () => {
              reject("User rejected");
            },
          };
          // @ts-ignore
          signMessage(signMessageOptions);
        });
      }
      setSignature(signature);
      /// check signature
      const address = walletContext.state.address;
      const verified = Verifier.verifySignature(address!, message, signature);
      if (!verified) {
        setIsLoading(false);
        setErrorMsg(`Sorry, invalid signature`);
        return;
      }
      const token = await getTickDeployer(ticker);
      if (token.msg) {
        setIsLoading(false);
        setErrorMsg(token.msg);
        return;
      }
      /// check token
      if (token.claimed) {
        setIsLoading(false);
        setErrorMsg(`Sorry, ${ticker} has been claimed`);
        return;
      }
      /// check creator
      if (token.deployer !== account) {
        setIsLoading(false);
        setErrorMsg(
          `${ticker} wa deployed by ${compactAddress(
            token.deployer
          )}, please connect with correct account.`
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
    <div className="flex flex-col mt-20 items-center z-1">
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
