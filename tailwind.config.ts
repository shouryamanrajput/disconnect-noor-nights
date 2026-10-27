import type { Config } from "tailwindcss";

// Palette sampled (Pillow, median of regions) from the Diwali House Party
// poster: hot-pink watercolour background, royal purple arch, lemon-yellow
// title with a forest-green drop shadow, coral pill with an orange border,
// yellow/orange florals, lime "disconnect" wordmark.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        magenta: "#E9227D", // poster background hot pink
        rani: "#C4166A", // deeper pink (section shading)
        blush: "#FF7FB8", // light pink highlight
        royal: "#712494", // poster arch purple
        plum: "#4E1470", // dark purple (header, button text, bars)
        night: "#33094A", // darkest purple (footer)
        marigold: "#FBE212", // poster title lemon yellow
        gold: "#F9DD21", // date / detail yellow
        amber: "#FFCE3C", // pill text gold
        saffron: "#F58A3E", // orange florals
        tangerine: "#FB8E32", // pill border orange
        coral: "#E2247C", // dress-code pill fill
        leaf: "#2C821B", // leaves
        forest: "#356428", // title drop shadow
        lime: "#D1FA87", // disconnect wordmark
        cream: "#FFF4D6", // body text on purple
      },
      fontFamily: {
        hindi: ["var(--font-hindi-title)", "var(--font-hindi)", "serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        caps: ["var(--font-caps)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "Georgia", "serif"],
      },
      maxWidth: { container: "1320px", content: "960px" },
    },
  },
  plugins: [],
};

export default config;
