import { OpenApiService } from "ord-tools";

export async function getTickDeployer(tick: string) {
  const res = await fetch(`/api/ticker/${tick}`);
  const result = await res.json();
  if (result.msg === "ok") {
    return result.data;
  } else {
    throw new Error(result.msg);
  }
}
