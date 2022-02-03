import { Default } from '@components/layouts/Default'
import '../styles/globals.css'

export default function Website ({
  Component,
  pageProps
}: any): JSX.Element {
  return (
    <Default {...pageProps}>
      <Component {...pageProps} />
    </Default>
  )
}
