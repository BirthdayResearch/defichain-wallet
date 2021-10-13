import { Head } from '@components/commons/Head'
import { Container } from '@components/commons/Container'

export default function NotFound (): JSX.Element {
  return (
    <>
      <Head>
        <title>Page Not Found - DeFiChain Wallet</title>
      </Head>

      <Container className='py-10'>
        <h1 className='text-3xl font-semibold'>
          404 - Page Not Found
        </h1>
      </Container>
    </>
  )
}
