import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warna LaundryIn
        primary: {
          DEFAULT: "#1B32BB", // Deep Blue
          hover: "#14248A",
        },
        secondary: {
          DEFAULT: "#F3EFE4", // Cream/Off-white
          dark: "#E5E0D1",
        }
      },
    },
  },
  plugins: [],
};
export default config;