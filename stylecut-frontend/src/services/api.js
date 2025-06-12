import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
});

// stylecut-frontend/postcss.config.cjs (renomear se necessário)
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};