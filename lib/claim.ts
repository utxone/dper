import bitcore from "bitcore-lib";
import { receiveAddress } from "./constant";
import { LocalWallet, NetworkType, OpenApiService, inscribe } from "ord-tools";
import { createSendBTC } from "@unisat/ord-utils";
import { AddressType } from "ord-tools/lib/types";
import * as bitcoin from "bitcoinjs-lib";

export async function getTickDeployer(tick: string) {
  const res = await fetch(`/api/ticker/${tick}`);
  const result = await res.json();
  if (result.msg === "ok") {
    return result.data;
  } else {
    throw new Error(result.msg);
  }
}

export async function claim({
  amount,
  ticker,
  signature,
  address,
  pubkey,
}: {
  amount: number;
  ticker: string;
  signature: string;
  address: string;
  pubkey: string;
}) {
  let txid = await (window as any).unisat.sendBitcoin(receiveAddress, 546);
  const res = await fetch(`/api/claim`, {
    method: "POST",
    body: JSON.stringify({
      txid,
      ticker,
      signature,
      address,
      pubkey,
    }),
  });
  const txHash = await res.json();
}

export function verifyMessage({
  message: text,
  pubkey,
  signature,
}: {
  message: string;
  pubkey: string;
  signature: string;
}) {
  const message = new bitcore.Message(text);

  const sig = bitcore.crypto.Signature.fromCompact(
    Buffer.from(signature, "base64")
  );
  const hash = message.magicHash();

  // recover the public key
  const ecdsa = new bitcore.crypto.ECDSA();
  ecdsa.hashbuf = hash;
  ecdsa.sig = sig;

  const pubkeyInSig = ecdsa.toPublicKey();

  const pubkeyInSigString = new bitcore.PublicKey(
    Object.assign({}, pubkeyInSig.toObject(), { compressed: true })
  ).toString();

  if (pubkeyInSigString != pubkey) {
    return false;
  }

  return bitcore.crypto.ECDSA.verify(hash, sig, pubkeyInSig);
}

export async function inscribeAndSend() {
  const wif = process.env.WALLET_WIF!;
  const wallet = new LocalWallet(wif, NetworkType.TESTNET, AddressType.P2TR);
  const brc20Api = new OpenApiService("bitcoin_testnet");
  const walletAddress = wallet.address;
  const walletPubkey =
    "03caafdac1fa341401b80977ef2de7c8e7730ba5d9ec650d2ab5717d758446f7a5";
  console.log(walletPubkey);
  const utxos = await brc20Api.getAddressUtxo(walletAddress);
  console.log(walletPubkey, utxos);

  const params = {
    utxos: utxos.reverse().map((v) => {
      return {
        txId: v.txId,
        outputIndex: v.outputIndex,
        satoshis: v.satoshis,
        scriptPk: v.scriptPk,
        addressType: v.addressType,
        address: walletAddress,
        ords: v.inscriptions ?? [],
      };
    }),
    inscription: {
      contentType: "text/plain;charset=utf-8",
      body: Buffer.from(
        `{"p": "brc-20","op": "transfer","tick": "bool","amt": "1"}`
      ),
    },
    address: walletAddress,
    wallet,
    changeAddress: walletAddress,
    pubkey: walletPubkey,
    feeRate: 2,
    dump: true,
    network: bitcoin.networks.testnet,
  };
  const inscribeTx = await inscribe(params);
  const transferTx = await wallet.pushPsbt(inscribeTx.toHex());
}

export async function transferBtc() {
  const wif = process.env.WALLET_WIF!;
  const wallet = new LocalWallet(wif, NetworkType.TESTNET, AddressType.P2TR);
  const brc20Api = new OpenApiService("bitcoin_testnet");
  const walletAddress = wallet.address;
  const walletPubkey = wallet.getPublicKey();
  console.log(walletPubkey);
  const utxosOutputs = await brc20Api.getAddressUtxo(walletAddress);
  console.log(utxosOutputs);
  const utxos = utxosOutputs.map((v) => ({
    txId: v.txId,
    outputIndex: v.outputIndex,
    satoshis: v.satoshis,
    scriptPk: v.scriptPk,
    addressType: v.addressType,
    address: walletAddress,
    ords: v.inscriptions ?? [],
  }));
  const testPsbt = await createSendBTC({
    utxos,
    toAddress: "tb1qaprhs93h9nefh06rxfeq8vt206slmgc3hqzfna",
    toAmount: 546,
    wallet,
    pubkey: walletPubkey,
    network: bitcoin.networks.testnet,
    feeRate: 1,
    changeAddress: walletAddress,
    dump: true,
  });
  return await wallet.pushPsbt(testPsbt.toHex());
}
