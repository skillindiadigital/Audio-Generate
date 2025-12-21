
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to be used in the source code
    // It will be replaced by the value of VITE_API_KEY from Vercel's env settings
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
});
