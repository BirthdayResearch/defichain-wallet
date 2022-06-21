import { PropsWithChildren, useMemo } from 'react'
import { Provider } from 'react-redux'
import { initializeStore } from '@store'
import { useWalletPersistenceContext } from '../../../shared/contexts/WalletPersistenceContext'
import { useServiceProviderContext } from './StoreServiceProvider'

/**
 * Store that is memoized to network & wallets setting.
 */
export function StoreProvider (props: PropsWithChildren<any>): JSX.Element {
  const { wallets } = useWalletPersistenceContext()
  const { url } = useServiceProviderContext()

  const store = useMemo(() => {
    return initializeStore()
  }, [wallets, url])

  return (
    <Provider store={store}>
      {props.children}
    </Provider>
  )
}
