import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("page_size") ?? 20);
  const skip = (page - 1) * pageSize;
  const total = await prisma.record.count({
    where: {
      hash: {
        not: "",
      },
    },
  });
  const data = await prisma.record.findMany({
    skip,
    take: pageSize,
    where: {
      hash: {
        not: "",
      },
    },
    orderBy: {
      create_at: "desc",
    },
  });
  return Response.json({ data, total: Math.ceil(total / pageSize ) });
}
