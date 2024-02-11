"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useEffect,
  useReducer,
} from "react";

interface WalletConfigProps {
  children?: ReactNode;
}

export enum Network {
  Testnet = "Testnet",
  Mainnet = "Livenet",
}
interface WalletState {
  wallet?: any;
  address?: string;
  pubkey?: string;
  network?: Network;
  label?: string;
  payment?: string
}

interface WalletAction {
  type: string;
  payload: unknown;
}

export const Wallet = createContext<{
  state: WalletState;
  dispatch?: Dispatch<WalletAction>;
}>({ state: {} });

function walletReducer(state: WalletState, action: WalletAction) {
  switch (action.type) {
    case "connect": {
      const { address, pubkey, network, wallet, label, payment } = action.payload as {
        address: string;
        pubkey: string;
        network: Network;
        label: string;
        payment: string;
        wallet: any;
      };
      return { ...state, address, pubkey, network, wallet, label, payment };
    }
    case "updateNetwork": {
      const { network } = action.payload as {
        network: Network;
      };
      return { ...state, network };
    }
    case "updateAddress": {
      const { address } = action.payload as {
        address: string;
      };
      return { ...state, address };
    }
    case "disconnect": {
      return {};
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function WalletConfig({ children }: WalletConfigProps) {
  const [state, dispatch] = useReducer<Reducer<WalletState, WalletAction>>(
    walletReducer,
    {}
  );
  const value = { state, dispatch };

  useEffect(() => {
    if (!state.wallet) return;
    state.wallet.on("networkChanged", (network: Network | undefined) => {
      dispatch({
        type: "updateNetwork",
        payload: {
          network,
        },
      });
    });
    state.wallet.on("accountsChanged", (accounts: string[]) => {
      // If the new account has already connected to your app then the newAccount will be returned
      if (accounts && accounts.length > 0) {
        dispatch({
          type: "updateAddress",
          payload: {
            address: accounts[0],
          },
        });
      }
    });
  }, [state, dispatch]);

  return <Wallet.Provider value={value}>{children}</Wallet.Provider>;
}

function useClient() {
  const { state } = useContext(Wallet);
  return state;
}

export { useClient, WalletConfig };
