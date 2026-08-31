import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@tanstack/react-virtual"],
  },
  server: {
    port: 5173,
    open: true,
  },
});
