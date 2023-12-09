import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  console.log(params);
  
  if (!params.id || params.id.length !== 4)
    return Response.json({ msg: "Invalid ticker" });
  const res = await fetch(
    `https://open-api.unisat.io/v1/indexer/brc20/${params.id}/info`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.UNISAT_API_KEY,
      },
    }
  );
  const data = await res.json();

  return Response.json(data);
}
