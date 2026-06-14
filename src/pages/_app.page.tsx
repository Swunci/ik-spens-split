import '../styles/global.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import { GoogleAnalytics } from 'nextjs-google-analytics';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter',
  },
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <ThemeProvider theme={theme}>
    <GoogleAnalytics strategy="lazyOnload" />
    <Component {...pageProps} />
  </ThemeProvider>
);

export default MyApp;
