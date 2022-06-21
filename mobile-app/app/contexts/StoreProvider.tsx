import { PropsWithChildren, useMemo } from 'react'
import { Provider } from 'react-redux'
import { initializeStore } from '@store'
import { useWalletPersistenceContext } from '../../../shared/contexts/WalletPersistenceContext'

/**
 * Store that is memoized to network & wallets setting.
 */
export function StoreProvider (props: PropsWithChildren<any>): JSX.Element {
  const { wallets } = useWalletPersistenceContext()

  const store = useMemo(() => {
    return initializeStore()
  }, [wallets])

  return (
    <Provider store={store}>
      {props.children}
    </Provider>
  )
}
