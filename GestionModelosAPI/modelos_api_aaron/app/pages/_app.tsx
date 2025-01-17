import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
  } from '@clerk/nextjs'
  import '../styles/globals.css';
  import App, { AppProps } from 'next/app';

  export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ClerkProvider
        publishableKey='pk_test_YWJzb2x1dGUtY29yZ2ktMjguY2xlcmsuYWNjb3VudHMuZGV2JA'>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <Component {...pageProps} />
        </ClerkProvider>
      )
  }
 