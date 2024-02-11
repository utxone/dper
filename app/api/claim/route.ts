import { networks } from "bitcoinjs-lib";
import { prisma } from "@/lib/prisma";
import { Verifier } from 'bip322-js';
import {
  LocalWallet,
  NetworkType,
  OpenApiService,
  createSendOrd,
  inscribe,
} from "ord-tools";
import { AddressType } from "ord-tools/lib/types";
import { TESTNET, HEIGHT } from "@/lib/constant";
import { calculateFee } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { txid, ticker, signature, address, pubkey, feeRate } = body;
  const result = await prisma.record.findFirst({
    where: {
      OR: [
        {
          ticker: {
            equals: ticker,
            mode: "insensitive",
          },
        },
        {
          txid,
        },
      ],
    },
  });
  if (result) {
    return Response.json({ msg: "Ticker or tx already claimed" });
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
  const message = `{op:dper} ${ticker} deployer verification`;
  const verified = Verifier.verifySignature(address, message, signature)

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
      msg: `ticker was not deployed before block ${HEIGHT}`,
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
    const fee = calculateFee({ feeRate, address });
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
  /// Use user txid
  let utxo: any[] = [];
  let j = 0;
  while (utxo.length === 0 && j < 5) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const utxos = await brc20Api.getAddressUtxo(walletAddress);
    utxo = utxos.filter((u) => u.txId === txid);
    j++;
  }
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
        ords: [],
      };
    }),
    inscription: {
      contentType: "text/plain;charset=utf-8",
      body: Buffer.from(
        `{"p":"brc-20","op":"transfer","tick":"depr","amt":"1000"}`
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
  const transferTx = await wallet.pushPsbt(inscribeTx.psbt.toHex());
  const inscriptionId = `${transferTx}i0`;
  let inscriptionsUtxos;
  let i = 0;
  while (!inscriptionsUtxos && i < 5) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      inscriptionsUtxos = await brc20Api.getInscriptionUtxo(inscriptionId);
    } catch (error) {
      console.log(error);
    }
    i++;
  }
  if (!inscriptionsUtxos) {
    return Response.json({ msg: "Inscription not found" });
  }
  const newUtxos = await brc20Api.getAddressUtxo(walletAddress);
  const input = newUtxos.filter((u: any) => u.txId === inscribeTx.txid);
  if (utxo.length === 0) {
    return Response.json({ msg: "Txid not found" });
  }
  const sendOrdParams = {
    utxos: [...input, inscriptionsUtxos].map((v) => {
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
