export const TESTNET = process.env.NEXT_PUBLIC_TESTNET! == "true";
export const HEIGHT = Number(process.env.NEXT_PUBLIC_HEIGHT!);
export const RECEIVER = process.env.NEXT_PUBLIC_RECEIVER!;
export const DEV_FEE = Number(process.env.NEXT_PUBLIC_DEV_FEE || 0);
