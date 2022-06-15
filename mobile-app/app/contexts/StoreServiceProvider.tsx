import { useNetworkContext } from '@shared-contexts/NetworkContext';
import { PropsWithChildren, useMemo } from 'react';
import { Provider, useSelector } from 'react-redux';
import { initializeStore, RootState } from '@store' 
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext';

// Store to retrieve default or user's custom service provider url 

export function StoreServiceProvider (props: PropsWithChildren<any>): JSX.Element {
  const { network } = useNetworkContext()
  
  // TODO: refresh app when store is updateed
  const store = useMemo(() => {
    return initializeStore()
  }, [network])

  return (
    <Provider store={store}>
      {props.children}
    </Provider>
  )
}