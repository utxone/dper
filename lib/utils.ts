export function compactAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

export function calculateFee({ feeRate }: { feeRate: number }) {
  const fileSize = Buffer.from(
    '{"p":"brc-20","op":"transfer","tick":"bool","amt":"1"}',
    "utf8"
  ).buffer.byteLength;
  const inscriptionBalance = 546; // the balance in each inscription
  const contentTypeSize = 100; // the size of contentType
  const fileCount = 1;
  const devFee = 2000; // the fee for developer
  const transferSize = 100;

  const balance = inscriptionBalance * fileCount;

  const addrSize = 22 + 1;

  const baseSize = 88;
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
  const total = balance + networkSats;
  return total + devFee + transferSize * feeRate;
}
