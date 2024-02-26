import bitcore from "bitcore-lib";

import {
  LocalWallet,
  NetworkType,
  OpenApiService,
  inscribe,
  createSendBTC,
} from "ord-tools";
import { AddressType } from "ord-tools/lib/types";
import * as bitcoin from "bitcoinjs-lib";
/// @ts-ignore
if (global._bitcore) delete global._bitcore;

export async function getTickDeployer(tick: string) {
  const res = await fetch(`/api/ticker/${tick}`);
  const result = await res.json();
  return result;
}

export async function claim({
  ticker,
  signature,
  address,
  pubkey,
  feeRate,
  txid,
}: {
  ticker: string;
  signature: string;
  address: string;
  pubkey: string;
  feeRate: number;
  txid: string;
}) {
  const res = await fetch(`/api/claim`, {
    method: "POST",
    body: JSON.stringify({
      txid,
      ticker,
      signature,
      address,
      pubkey,
      feeRate,
    }),
  });
  const txHash = await res.json();
  if (txHash.msg) {
    throw new Error(txHash.msg);
  }
  return txHash.tx;
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
  const walletPubkey = wallet.pubkey;
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
        `{"p": "brc-20","op": "transfer","tick": "dper","amt": "1000"}`
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
  return await wallet.pushPsbt(inscribePsbt.psbt.toHex());
}

export async function transferBtc() {
  const wif = process.env.WALLET_WIF!;
  const wallet = new LocalWallet(wif, NetworkType.TESTNET, AddressType.P2TR);
  const brc20Api = new OpenApiService("bitcoin_testnet");
  const walletAddress = wallet.address;
  const walletPubkey = wallet.getPublicKey();
  const utxosOutputs = await brc20Api.getAddressUtxo(walletAddress);
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
