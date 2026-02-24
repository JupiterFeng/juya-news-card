import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devHost = env.VITE_DEV_HOST?.trim() || '0.0.0.0';
  const devPort = parsePort(env.VITE_DEV_PORT, 3000);
  const renderApiPort = parsePort(env.RENDER_API_PORT || env.VITE_RENDER_API_PORT, 8080);
  const defaultApiProxyTarget = `http://127.0.0.1:${renderApiPort}`;
  const apiProxyTarget = env.VITE_API_PROXY_TARGET?.trim() || (mode === 'development' ? defaultApiProxyTarget : '');

  return {
    server: {
      host: devHost,
      port: devPort,
      ...(apiProxyTarget
        ? {
            proxy: {
              '/api': {
                target: apiProxyTarget,
                changeOrigin: true,
                rewrite: (proxyPath) => proxyPath.replace(/^\/api/, ''),
              },
            },
          }
        : {}),
    },
    plugins: [react()],
    build: {
      modulePreload: {
        resolveDependencies: (_url, deps) =>
          deps.filter(dep =>
            !dep.includes('vendor-export') &&
            !dep.includes('export-preview-image') &&
            !dep.includes('export-preview-html') &&
            !dep.includes('export-render-api-image')
          ),
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/@mui/')) return 'vendor-mui';
            if (id.includes('/node_modules/@emotion/')) return 'vendor-emotion';
            if (id.includes('/node_modules/html2canvas/')) return 'vendor-export';
            if (id.includes('/node_modules/@zumer/snapdom/')) return 'vendor-export';
            if (id.includes('/node_modules/')) return 'vendor-misc';
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
