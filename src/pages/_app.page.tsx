import '../styles/global.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { GoogleAnalytics } from 'nextjs-google-analytics';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter',
  },
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <ThemeProvider theme={theme}>
    <PayPalScriptProvider
      options={{ clientId: process.env.NEXT_PUBLIC_CLIENT_ID }}
    >
      <Script
        id="Adsense-id"
        data-ad-client="ca-pub-8556410874703049"
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8556410874703049"
        crossOrigin="anonymous"
      />
      <GoogleAnalytics strategy="lazyOnload" />
      <Component {...pageProps} />
    </PayPalScriptProvider>
  </ThemeProvider>
);

export default MyApp;
