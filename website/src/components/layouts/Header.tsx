import { DeFiChainLogo } from '@components/icons/DeFiChainLogo'
import { Container } from '@components/commons/Container'
import Link from 'next/link'

export function Header (): JSX.Element {
  return (
    <header className='bg-white'>
      <div className='border-b border-gray-100'>
        <Container className='py-4 md:py-8'>
          <div className='flex items-center justify-between'>
            <div className='flex'>
              <Link href={{ pathname: '/' }} passHref>
                <a className='flex items-center cursor-pointer hover:text-primary-500'>
                  <DeFiChainLogo className='w-16 h-full' />
                  <h6 className='ml-3 text-xl font-medium'>Wallet</h6>
                </a>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </header>
  )
}
