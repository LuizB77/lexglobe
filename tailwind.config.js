/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: "#0A0A1A",
        brand: "#7F77DD",
        "code-constituicao": "#FFD700",
        "code-penal": "#E53E3E",
        "code-civil": "#7F77DD",
        "code-clt": "#1D9E75",
        "code-eca": "#F6AD55",
        "code-cdc": "#63B3ED",
      },
    },
  },
  plugins: [],
}
