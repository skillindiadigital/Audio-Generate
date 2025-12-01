import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Maps process.env.API_KEY to import.meta.env.VITE_API_KEY
    // This allows the existing code using process.env.API_KEY to work on Vercel
    // Ensure you set VITE_API_KEY in your Vercel project settings
    'process.env.API_KEY': 'import.meta.env.VITE_API_KEY'
  }
});