import { networks } from "bitcoinjs-lib";
import { prisma } from "@/lib/prisma";
import {
  LocalWallet,
  NetworkType,
  OpenApiService,
  createSendOrd,
  inscribe,
} from "ord-tools";
import { AddressType } from "ord-tools/lib/types";
import { TESTNET, HEIGHT } from "@/lib/constant";
import { verifyMessage } from "@/lib/claim";
import { calculateFee } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { txid, ticker, signature, address, pubkey, feeRate } = body;
  console.log({ body });
  const result = await prisma.record.findFirst({
    where: {
      ticker: {
        equals: ticker,
        mode: "insensitive",
      },
    },
  });
  if (result) {
    return Response.json({ msg: "Ticker already claimed" });
  }
  /// save to database
  const record = await prisma.record.create({
    data: {
      ticker,
      holder: address,
      txid,
      hash: "",
    },
  });
  /// check if the body is valid
  if (!txid || !ticker || !signature || !pubkey || !feeRate) {
    return Response.json({ msg: "Invalid body" });
  }
  /// verify signature
  const message = `{op:depr} ${ticker} deployer verification`;
  const verified = verifyMessage({
    message,
    pubkey,
    signature,
  });

  if (!verified) {
    return Response.json({ msg: "Invalid signature" });
  }
  const res = await fetch(
    `${process.env.UNISAT_API_URL}/indexer/brc20/${ticker}/info`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.UNISAT_API_KEY,
      },
    }
  );
  const token = await res.json();

  /// check block height
  if (token.data.deployHeight > HEIGHT) {
    return Response.json({
      msg: "ticker was not deployed before block 819394",
    });
  }
  /// check creator
  if (token.data.creator !== address) {
    return Response.json({ msg: "Invalid signature" });
  }

  /// check txid
  try {
    const resTx = await fetch(
      `https://mempool.space/${TESTNET ? "testnet/" : ""}api/tx/${txid}`
    );
    if (resTx.status != 200) {
      return Response.json({ msg: "invalid txid" });
    }
    const tx = await resTx.json();
    const fee = calculateFee({ feeRate });
    console.log(fee, tx.vout[0].value);
    if (tx.vout[0].value !== fee.total) {
      return Response.json({ msg: "invalid tx" });
    }
  } catch (error) {
    return Response.json({ msg: "error occurred" });
  }
  /// inscribe and transfer
  const wif = process.env.WALLET_WIF!;
  const wallet = new LocalWallet(
    wif,
    TESTNET ? NetworkType.TESTNET : NetworkType.MAINNET,
    AddressType.P2TR
  );
  const brc20Api = new OpenApiService(TESTNET ? "bitcoin_testnet" : "bitcoin");
  const walletAddress = wallet.address;
  const walletPubkey = wallet.getPublicKey();
  const utxos = await brc20Api.getAddressUtxo(walletAddress);
  console.log(utxos);
  /// Use user txid
  const utxo = utxos.filter((u) => u.txId === txid);
  if (utxo.length === 0) {
    return Response.json({ msg: "Txid not found" });
  }
  const params = {
    utxos: utxo.map((v) => {
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
        `{"p": "brc-20","op": "transfer","tick": "${ticker}","amt": "1"}`
      ),
    },
    address: walletAddress,
    wallet,
    changeAddress: walletAddress,
    pubkey: walletPubkey,
    feeRate,
    dump: true,
    network: TESTNET ? networks.testnet : networks.bitcoin,
  };
  const inscribeTx = await inscribe(params);
  // const insTx = inscribeTx.extractTransaction();
  const transferTx = await wallet.pushPsbt(inscribeTx.toHex());
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const newUtxos = await brc20Api.getAddressUtxo(walletAddress);
  const inscriptionId = `${transferTx}i0`;
  const inscriptionsUtxos = await brc20Api.getInscriptionUtxo(inscriptionId);
  if (!inscriptionsUtxos) {
    return Response.json({ msg: "error occurred" });
  }
  const sendOrdParams = {
    utxos: [...newUtxos, inscriptionsUtxos].map((v) => {
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
    address: walletAddress,
    wallet,
    toAddress: address,
    toOrdId: inscriptionId,
    changeAddress: walletAddress,
    pubkey: walletPubkey,
    outputValue: 546,
    feeRate,
    dump: true,
    network: TESTNET ? networks.testnet : networks.bitcoin,
  };
  const transferPsbt = await createSendOrd(sendOrdParams);
  // @ts-ignore
  transferPsbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
  const ordTx = transferPsbt.extractTransaction();
  const transferHash = await wallet.pushPsbt(ordTx.toHex());
  /// save to database
  await prisma.record.update({
    where: { id: record.id },
    data: {
      hash: transferHash,
    },
  });

  return Response.json({ tx: transferHash });
}
