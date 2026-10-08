import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getrepeat.app',
  appName: 'getrepeat.in',
  webDir: 'public',
  server: {
    url: 'https://app.getrepeat.in',
    cleartext: true,
    allowNavigation: [
      '*.getrepeat.in',
      '*.clerk.accounts.dev',
      'accounts.google.com',
      '*'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ea580c",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
