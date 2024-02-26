import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params.id || params.id.length !== 4)
    return Response.json({ msg: "Invalid ticker" });
  const record = await prisma.record.findFirst({
    where: {
      ticker: {
        equals: params.id,
        mode: 'insensitive',
      }
    }
  })
  const tickerInfo = await prisma.ticker.findFirst({
    where: {
      tick: params.id
    }
  })
  if(!tickerInfo) {
    return Response.json({ msg: "Ticker not found" });
  }
  return Response.json({
    ...tickerInfo, claimed: !!record
  });
}
