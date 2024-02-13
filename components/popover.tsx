import { Dispatch, SetStateAction, ReactNode } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export default function Popover({
  children,
  content,
  align = "center",
  openPopover,
  setOpenPopover
}: {
  children: ReactNode;
  content: ReactNode | string;
  align?: "center" | "start" | "end";
  openPopover: boolean;
  setOpenPopover: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <PopoverPrimitive.Root open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverPrimitive.Trigger className="inline-flex" asChild>
          {children}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Content
          sideOffset={2}
          align={align}
          className="z-20 animate-slide-up-fade flex flex-col items-center space-y-0 rounded-md bg-love-100 drop-shadow-sm"
        >
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    </>
  );
}
