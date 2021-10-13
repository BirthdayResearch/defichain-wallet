import NextNProgress from 'nextjs-progressbar'
import { Default } from '@components/layouts/Default'
import '../styles/globals.css'

export default function Website ({
  Component,
  pageProps
}: any): JSX.Element {
  return (
    <Default {...pageProps}>
      <NextNProgress color='#ff00af' height={2} options={{ showSpinner: false }} />
      <Component {...pageProps} />
    </Default>
  )
}
