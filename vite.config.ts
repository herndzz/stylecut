import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.VITE_DEV_SERVER_PORT || 5173);
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:3000';
  const basePath = env.VITE_API_BASE_PATH || '/api';

  return defineConfig({
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      port,
      proxy: {
        [basePath]: {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      globals: true,
    },
  });
};
