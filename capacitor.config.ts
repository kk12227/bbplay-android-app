import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:    'ru.bbplay.app',
  appName:  'BBplay',
  webDir:   'dist',
  server: {
    androidScheme: 'https',
    // Для разработки раскомментируй и укажи IP компьютера:
    // url: 'http://192.168.1.100:5173',
    // cleartext: true,
  },
  plugins: {
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#09090f',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration:  2000,
      launchAutoHide:      true,
      backgroundColor:     '#09090f',
      androidSplashResourceName: 'splash',
      showSpinner:         false,
      splashFullScreen:    true,
      splashImmersive:     true,
    },
    App: {
      // Обработка back-button на Android
    },
  },
  android: {
    buildOptions: {
      keystorePath:  'release.keystore',
      keystoreAlias: 'bbplay',
    },
  },
  ios: {
    contentInset: 'always',
  },
}

export default config
