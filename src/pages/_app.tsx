import '../styles/global.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter',
  },
});
const MyApp = ({ Component, pageProps }: AppProps) => (
  <ThemeProvider theme={theme}>
    <Component {...pageProps} />
  </ThemeProvider>
);

export default MyApp;
