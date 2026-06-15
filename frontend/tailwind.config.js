/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: "#FFE5D4",
        lavender: "#EADCF8",
        blush: "#FCE7F3",
        rosegold: "#F8C8DC",
      },

      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        script: ["Dancing Script", "cursive"],
      },

      boxShadow: {
        petal: "0 10px 30px rgba(236,72,153,0.15)",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        petal: "petalFall 12s linear infinite",
      },

      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },

        petalFall: {
          "0%": {
            transform: "translateY(-100px) rotate(0deg)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateY(120vh) rotate(360deg)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
};