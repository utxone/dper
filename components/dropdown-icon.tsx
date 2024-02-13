import { SVGProps } from "react";

export default function ArrowDropDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="m12 15l-5-5h10z"></path>
    </svg>
  );
}
