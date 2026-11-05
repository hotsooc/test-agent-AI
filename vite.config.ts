import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const createProxy = (target: string, prefix: string, isAuth = false) => ({
  target,
  changeOrigin: true,
  rewrite: (path: string) => path.replace(new RegExp(`^${prefix}`), ''),
  secure: false,
  cookieDomainRewrite: isAuth ? '' : undefined,
  configure: (proxy: any) => {
    proxy.on('error', (err: any, _req: any, res: any) => {
      // Suppress noisy ECONNRESET / ETIMEDOUT from flooding the terminal
      if (res && !res.headersSent && typeof res.writeHead === 'function') {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy connection error', message: err?.message || 'Error' }));
      }
    });
    proxy.on('proxyReq', (proxyReq: any) => {
      // Remove browser Origin and Referer headers so Riot's API gateway doesn't reject them
      proxyReq.removeHeader('origin');
      proxyReq.removeHeader('referer');
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/riot-auth': createProxy('https://auth.riotgames.com', '/riot-auth', true),
      '/riot-entitlements': createProxy('https://entitlements.auth.riotgames.com', '/riot-entitlements', true),
      '/riot-pas': createProxy('https://riot-geo.pas.si.riotgames.com', '/riot-pas'),
      '/riot-pd-ap': createProxy('https://pd.ap.a.pvp.net', '/riot-pd-ap'),
      '/riot-pd-na': createProxy('https://pd.na.a.pvp.net', '/riot-pd-na'),
      '/riot-pd-eu': createProxy('https://pd.eu.a.pvp.net', '/riot-pd-eu'),
      '/riot-pd-kr': createProxy('https://pd.kr.a.pvp.net', '/riot-pd-kr'),
      '/riot-shared-ap': createProxy('https://shared.ap.a.pvp.net', '/riot-shared-ap'),
    },
  },
});
