import { Wallet } from "@/lib/use-wallet";
import { Dispatch, SetStateAction, useContext, useCallback } from "react";
import { getAddress } from "sats-connect";
import Image from "next/image";
import Modal from "./modal";
import { TESTNET } from "@/lib/constant";

export default function WalletConnectModal({
  showConnectModal,
  setShowConnectModal,
}: {
  showConnectModal: boolean;
  setShowConnectModal: Dispatch<SetStateAction<boolean>>;
}) {
  const walletContext = useContext(Wallet);
  const connectUnisat = useCallback(async () => {
    const wallet = (window as any).unisat;
    if (!wallet) {
      return;
    }
    const accounts = await wallet.requestAccounts();
    const network = await wallet.getNetwork();
    const pubkey = await wallet.getPublicKey();
    if (accounts && accounts.length > 0) {
      walletContext.dispatch!({
        type: "connect",
        payload: {
          address: accounts[0],
          pubkey,
          network,
          label: "unisat",
          wallet,
        },
      });
      return;
    }
  }, [walletContext.dispatch]);

  const connectXverse = useCallback(async () => {
    const getAddressOptions = {
      payload: {
        purposes: ["ordinals", "payment"],
        message: "{ op: dper }",
        network: {
          type: TESTNET ? "Testnet" : "Mainnet",
        },
      },
      onFinish: (response: any) => {
        console.log(response);
        walletContext.dispatch!({
          type: "connect",
          payload: {
            address: response.addresses[0].address,
            payment: response.addresses[1].address,
            pubkey: response.addresses[0].publicKey,
            network: TESTNET ? "Testnet" : "Mainnet",
            label: "xverse",
          },
        });
      },
      onCancel: () => {},
    };
    // @ts-ignore
    await getAddress(getAddressOptions);
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
          onClick={connectUnisat}
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
          className="p-4 flex rounded-md flex-row space-x-2 h-full w-full hover:bg-love-300"
          onClick={connectXverse}
        >
          <Image
            src="/logo_xverse.png"
            unoptimized
            height="30"
            width="30"
            alt="xverse"
          ></Image>
          <span className="text-2xl font-weight">Xverse</span>
        </button>
      </div>
    </Modal>
  );
}
