
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, (process as any).cwd(), '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Prioritize process.env.API_KEY (system) -> env.API_KEY (.env) -> env.GEMINI_API_KEY -> VITE_ prefixes
        'process.env.API_KEY': JSON.stringify(
            process.env.API_KEY || 
            env.API_KEY || 
            env.GEMINI_API_KEY || 
            env.VITE_API_KEY || 
            env.VITE_GEMINI_API_KEY || 
            ''
        ),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});