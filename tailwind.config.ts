import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        'phone': '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08), 0 0 25px 0 rgba(0, 0, 0, 0.05)',
        'phone-inner': 'inset 0 0 4px 2px rgba(255, 255, 255, 0.15)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        'phone': '52px',
        'phone-screen': '42px',
      }
    },
  },
  plugins: [],
};

export default config;
