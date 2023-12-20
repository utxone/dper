import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params.id || params.id.length !== 4)
    return Response.json({ msg: "Invalid ticker" });
  console.log(`${process.env.UNISAT_API_URL}/indexer/brc20/${params.id}/info`);

  const res = await fetch(`${process.env.UNISAT_API_URL}/indexer/brc20/${params.id}/info`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.UNISAT_API_KEY,
    },
  });
  const data = await res.json();
  const record = await prisma.record.findFirst({
    where: {
      ticker: {
        equals: params.id,
        mode: 'insensitive',
      }
    }
  })
  if(data.data) {
    data.data.claimed = !!record
  }
  return Response.json(data);
}
