import { networks } from "bitcoinjs-lib";
import { prisma } from "@/lib/prisma";
import { LocalWallet, NetworkType, OpenApiService, inscribe } from "ord-tools";
import { AddressType } from "ord-tools/lib/types";
import { blockHeight, unisatApiUrl } from "@/lib/constant";
import { verifyMessage } from "@/lib/claim";

export async function POST(request: Request) {
  const body = await request.json();
  const { txid, ticker, signature, address, pubkey } = body;
  /// check if the body is valid
  if (!txid || !ticker || !signature || !pubkey) {
    return Response.json({ msg: "invalid body" });
  }
  /// verify signature
  const message = `{op:depr} ${ticker} deployer verification`;
  const verified = verifyMessage({
    message,
    pubkey,
    signature,
  });

  if (!verified) {
    return Response.json({ msg: "invalid signature" });
  }
  const res = await fetch(`${unisatApiUrl}/indexer/brc20/${ticker}/info`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.UNISAT_API_KEY,
    },
  });
  const token = await res.json();

  /// check block height
  if (token.data.deployHeight > blockHeight) {
    return Response.json({
      msg: "ticker was not deployed before block 819394",
    });
  }
  /// check creator
  if (token.data.creator !== address) {
    return Response.json({ msg: "invalid signature" });
  }

  /// check txid
  const resTx = await fetch(`${unisatApiUrl}/indexer/tx/${txid}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.UNISAT_API_KEY,
    },
  });
  const tx = await resTx.json();
  if (tx.msg !== "ok") {
    return Response.json({ msg: "invalid txid" });
  }
  /// inscribe and transfer
  const wif = process.env.WALLET_WIF!;
  console.log(wif);
  const wallet = new LocalWallet(wif, NetworkType.TESTNET, AddressType.P2TR);
  const brc20Api = new OpenApiService("bitcoin_testnet");
  const walletAddress = wallet.address;
  const walletPubkey = wallet.getPublicKey();
  const utxos = await brc20Api.getAddressUtxo(walletAddress);
  console.log(utxos);

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
    network: networks.testnet,
  };
  const inscribeTx = await inscribe(params);
  const transferTx = await wallet.pushPsbt(inscribeTx.toHex());
  /// save to database
  await prisma.record.create({
    data: {
      ticker,
      holder: address,
      hash: transferTx,
    },
  });

  return Response.json({ tx: transferTx });
}
