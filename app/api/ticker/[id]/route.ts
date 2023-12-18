import { unisatApiUrl } from "./../../../../lib/constant";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params.id || params.id.length !== 4)
    return Response.json({ msg: "Invalid ticker" });
  console.log(`${unisatApiUrl}/indexer/brc20/${params.id}/info`);

  const res = await fetch(`${unisatApiUrl}/indexer/brc20/${params.id}/info`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.UNISAT_API_KEY,
    },
  });
  const data = await res.json();

  return Response.json(data);
}
