import bitcore from "bitcore-lib";

import { receiveAddress } from "./constant";
import {
  LocalWallet,
  NetworkType,
  OpenApiService,
  inscribe,
  createSendBTC,
} from "ord-tools";
import { AddressType } from "ord-tools/lib/types";
import * as bitcoin from "bitcoinjs-lib";
import { calculateFee } from "./utils";
/// @ts-ignore
if (global._bitcore) delete global._bitcore;

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
  testnet,
}: {
  amount: number;
  ticker: string;
  signature: string;
  address: string;
  pubkey: string;
  testnet: boolean;
}) {
  const response = await fetch(
    `https://mempool.space/${testnet ? "testnet/" : ""}api/v1/fees/recommended`
  );
  const feeSummary = await response.json();
  const feeRate = feeSummary.halfHourFee;
  const inscribeFee = calculateFee({
    feeRate,
  });
  let txid = await (window as any).unisat.sendBitcoin(
    receiveAddress,
    inscribeFee
  );
  const res = await fetch(`/api/claim`, {
    method: "POST",
    body: JSON.stringify({
      txid,
      ticker,
      signature,
      address,
      pubkey,
      feeRate
    }),
  });
  const txHash = await res.json();
  return txHash.tx
}

/// verify bitcoin signed message
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

/// inscribe transfer and send
export async function inscribeAndSend() {
  const wif = process.env.WALLET_WIF!;
  const wallet = new LocalWallet(wif, NetworkType.TESTNET, AddressType.P2TR);
  const brc20Api = new OpenApiService("bitcoin_testnet");
  const walletAddress = wallet.address;
  const walletPubkey =
    "03caafdac1fa341401b80977ef2de7c8e7730ba5d9ec650d2ab5717d758446f7a5";
  const utxos = await brc20Api.getAddressUtxo(walletAddress);
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
    feeRate: 1,
    dump: true,
    network: bitcoin.networks.testnet,
  };
  const inscribePsbt = await inscribe(params);
  // @ts-ignore
  inscribePsbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
  const tx = inscribePsbt.extractTransaction();
  console.log('inscribe tx', tx.toHex());
  return await wallet.pushPsbt(tx.toHex());
}

export async function transferBtc() {
  const wif = process.env.WALLET_WIF!;
  const wallet = new LocalWallet(wif, NetworkType.TESTNET, AddressType.P2TR);
  const brc20Api = new OpenApiService("bitcoin_testnet");
  const walletAddress = wallet.address;
  const walletPubkey = wallet.getPublicKey();
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
    toAmount: 1000,
    wallet,
    pubkey: walletPubkey,
    network: bitcoin.networks.testnet,
    feeRate: 1,
    changeAddress: walletAddress,
    dump: true,
  });
  // @ts-ignore
  testPsbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
  const tx = testPsbt.extractTransaction();
  return await wallet.pushPsbt(tx.toHex());
}
