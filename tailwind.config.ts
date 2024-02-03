import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "love": {
          "50": "#faf5f7",
          "100": "#f6edef",
          "200": "#efdbe0",
          "300": "#e3bec7",
          "400": "#d195a3",
          "500": "#c07484",
          "600": "#a3525f",
          "700": "#91454f",
          "800": "#793b42",
          "900": "#66353b",
          "950": "#3c1b1f",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
