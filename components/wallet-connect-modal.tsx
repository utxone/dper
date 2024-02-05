import { Wallet } from "@/lib/use-wallet";
import { Dispatch, SetStateAction, useContext, useCallback } from "react";
import Image from "next/image";
import Modal from "./modal";

export default function WalletConnectModal({
  showConnectModal,
  setShowConnectModal,
}: {
  showConnectModal: boolean;
  setShowConnectModal: Dispatch<SetStateAction<boolean>>;
}) {
  const walletContext = useContext(Wallet);
  const connect = useCallback(async () => {
    const wallet = (window as any).unisat;
    if (!wallet) {
      return;
    }
    const accounts = await wallet.requestAccounts();
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
