import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9403d1d677eb446c9aa39095480f5882',
  appName: 'dawaa-plus-buddy',
  webDir: 'dist',
  server: {
    url: 'https://9403d1d6-77eb-446c-9aa3-9095480f5882.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Dawaa+',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
