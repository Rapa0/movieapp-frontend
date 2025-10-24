import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MovieApp-Frontend',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'tu-url-de-backend.onrender.com' 
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: true 
  }
};

export default config;