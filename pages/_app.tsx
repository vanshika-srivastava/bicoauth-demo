import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import "@Biconomy/web3-auth/dist/src/style.css"


export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
