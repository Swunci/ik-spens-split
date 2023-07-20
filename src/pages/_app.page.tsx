import '../styles/global.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { AppProps } from 'next/app';

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
      <Component {...pageProps} />
    </PayPalScriptProvider>
  </ThemeProvider>
);

export default MyApp;
