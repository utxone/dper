"use client";
import { Tooltip as ReactTooltip } from "react-tooltip";

export default function Tooltip({ id }: { id: string }) {
  return (
    <ReactTooltip anchorSelect={`#${id}`} clickable place="top">
        {process.env.NEXT_PUBLIC_DONATE_ADDRESS}
    </ReactTooltip>
  );
}
