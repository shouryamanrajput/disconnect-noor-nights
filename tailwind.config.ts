import type { Config } from "tailwindcss";

// Palette from the Diwali House Party banner: warm magenta→plum background,
// deep purple arch + header, marigold/gold type, orange florals.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        magenta: "#BD1656", // warm magenta (banner background)
        rani: "#891241", // deep rani / wine
        blush: "#FF5FB0", // light pink highlight
        royal: "#2F095D", // arch / card purple
        plum: "#27095E", // header purple (button text, bars)
        night: "#170433", // darkest purple (footer)
        marigold: "#FFD43B", // display type
        gold: "#F5B700", // deeper gold (rules, borders)
        saffron: "#FF8A1F", // orange florals
        leaf: "#2F9E44", // garland leaves
        cream: "#FFF4D6", // body text on purple
      },
      fontFamily: {
        hindi: ["var(--font-hindi)", "serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        caps: ["var(--font-caps)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { container: "1180px", content: "960px" },
    },
  },
  plugins: [],
};

export default config;
