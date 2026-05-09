/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#6d5dfc",
          600: "#4f46e5"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(109, 93, 252, 0.25)"
      }
    }
  },
  plugins: []
};
