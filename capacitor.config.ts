import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MovieApp-Frontend',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'api.themoviedb.org',
      'movieapp-backend-nmo9.onrender.com'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;