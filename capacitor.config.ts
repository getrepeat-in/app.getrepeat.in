import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getrepeat.app',
  appName: 'getrepeat.in',
  webDir: 'public',
  server: {
    url: 'https://app.getrepeat.in',
    cleartext: true
  }
};

export default config;
