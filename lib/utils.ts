import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const dateFromNow = (date: string | Date) => {
  return dayjs(date).fromNow(); // 22 years ago
};

export function compactAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

export function inscriptionContent(ticker: string, amt: string) {
  return Buffer.from(
    `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amt}"}`,
    "utf8"
  );
}

export function calculateFee({ feeRate }: { feeRate: number }) {
  const fileSize = inscriptionContent("bool", "1000").length;
  const inscriptionBalance = 546; // the balance in each inscription
  const contentTypeSize = 100; // the size of contentType
  const fileCount = 1;
  const devFee = 2000; // the fee for developer
  const transferSize = 214; // send ord miner fee
  const firstTransferSize = 154; // gas fee for send balance to inscribe account

  const balance = inscriptionBalance * fileCount;

  const addrSize = 34 + 1;

  const baseSize = 44;
  let networkSats = Math.ceil(
    ((fileSize + contentTypeSize) / 4 + (baseSize + 8 + addrSize + 8 + 23)) *
      feeRate
  );
  if (fileCount > 1) {
    networkSats = Math.ceil(
      ((fileSize + contentTypeSize) / 4 +
        (baseSize +
          8 +
          addrSize +
          (35 + 8) * (fileCount - 1) +
          8 +
          23 +
          (baseSize + 8 + addrSize + 0.5) * (fileCount - 1))) *
        feeRate
    );
  }
  const inscribeFee = balance + networkSats + firstTransferSize * feeRate;
  const transferFee = transferSize * feeRate;
  const total = inscribeFee + devFee + transferFee;
  return {
    inscribeFee,
    devFee,
    transferFee,
    total,
  };
}
