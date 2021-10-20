/* eslint-disable no-restricted-imports */
import Head from 'next/head'
import { PropsWithChildren } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

const title = 'DeFiChain Wallet'
const description = 'DeFiChain Wallet'

/**
 * Default Layout with <Head> providing default Metadata for SEO
 */
export function Default (props: PropsWithChildren<{}>): JSX.Element | null {
  return (
    <div className='flex flex-col min-h-screen'>
      <Head>
        <meta charSet='UTF-8' />

        <title key='title'>{title}</title>
        <meta key='description' name='description' content={description} />
        <meta key='robots' name='robots' content='follow,index' />
        <meta key='viewport' name='viewport' content='user-scalable=no, width=device-width, initial-scale=1' />
        <meta key='apple-mobile-web-app-capable' name='apple-mobile-web-app-capable' content='yes' />

        <meta key='og:locale' name='og:locale' content='en_US' />
        <meta key='og:title' name='og:title' content={title} />
        <meta key='og:site_name' name='og:site_name' content={title} />
        <meta key='og:description' name='og:description' content={description} />

        <link rel='icon' href='/favicon.ico' />
        <link rel='icon' type='image/png' sizes='48x48' href='/favicon.png' />
      </Head>

      <Header />

      <main className='flex-grow'>
        {props.children}
      </main>

      <Footer />
    </div>
  )
}
