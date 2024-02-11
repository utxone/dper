import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const dateFromNow = (date: string | Date) => {
  return dayjs(date).fromNow(); // 22 years ago
};

export function compactAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

function getAddressOutputSize(address: string) {
  // P2TR address
  if (address.startsWith("bc1p") || address.startsWith("tb1p")) {
    return 43;
  }
  // P2WPKH address
  if (address.startsWith("bc1q") || address.startsWith("tb1q")) {
    return 31;
  }
  // P2SH address
  if (address.startsWith("2") || address.startsWith("3")) {
    return 32;
  }
  // P2PKH
  return 34;
}

export function calculateFee({
  feeRate,
  address,
}: {
  feeRate: number;
  address: string;
}) {
  const outputSize = getAddressOutputSize(address);
  const inscriptionBalance = 546; // the balance in each inscription
  const devFee = 0; // the fee for developer
  const transferSize = 57.5 * 2 + 43 + outputSize + 10.5; // send ord miner fee
  const firstTransferSize = 154 * feeRate; // gas fee for send balance to inscribe account
  const networkSats = Math.ceil(152.5 * feeRate)
  const inscribeFee = inscriptionBalance + networkSats + firstTransferSize;
  const transferFee = Math.ceil(transferSize * feeRate);
  const total = inscribeFee + devFee + transferFee;
  return {
    inscribeFee,
    devFee,
    transferFee,
    total,
  };
}
