declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      NEXT_PUBLIC_CLIENT_ID: string;
      CLIENT_SECRET: string;
      PAYPAL_API_URL: string;
      EXCHANGE_RATES_API_URL: string;
    }
  }
}

export {};
