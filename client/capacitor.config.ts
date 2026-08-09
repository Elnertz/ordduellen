import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor wraps the built web client (client/dist) into native iOS/Android
// apps. Build the web assets with VITE_API_BASE pointing at your deployed
// backend, then `npx cap sync`. Native projects (ios/, android/) are generated
// on your machine with `npx cap add ios` / `npx cap add android`.
const config: CapacitorConfig = {
  appId: 'se.ordduellen.app',
  appName: 'Ordduellen',
  webDir: 'dist',
  backgroundColor: '#0b1020',
  ios: {
    contentInset: 'always',
  },
};

export default config;
