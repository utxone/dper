import Image from "next/image";

export default function Header() {
  return (
    <div className="fixed top-0 p-8 flex flex-row justify-between text-stone-300">
      <svg
        width="60"
        height="60"
        viewBox="0 0 350 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M167 75C111.772 75 67 119.772 67 175C67 230.228 111.772 275 167 275V75Z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M153.667 89.3526C112.132 95.766 80.3333 131.67 80.3333 175C80.3333 218.33 112.132 254.234 153.667 260.647V89.3526ZM153.667 75.8811C104.742 82.3997 67 124.292 67 175C67 225.708 104.742 267.6 153.667 274.119C158.028 274.7 162.479 275 167 275V75C162.479 75 158.028 75.3 153.667 75.8811Z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M185 75C240.228 75 285 119.772 285 175C285 230.228 240.228 275 185 275V75Z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M198.333 89.3526C239.868 95.766 271.667 131.67 271.667 175C271.667 218.33 239.868 254.234 198.333 260.647V89.3526ZM198.333 75.8811C247.258 82.3997 285 124.292 285 175C285 225.708 247.258 267.6 198.333 274.119C193.972 274.7 189.521 275 185 275V75C189.521 75 193.972 75.3 198.333 75.8811Z"
          fill="currentColor"
        />
        <path d="M157 265.5L157 4" stroke="currentColor" stroke-width="20" />
        <path d="M195 341L195 82.5" stroke="currentColor" stroke-width="20" />
        <circle cx="175" cy="175" r="165" stroke="currentColor" stroke-width="20" />
      </svg>
    </div>
  );
}
