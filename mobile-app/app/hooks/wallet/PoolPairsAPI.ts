import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { DexItem, wallet } from '@store/wallet'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

export function usePoolPairsAPI (): DexItem[] {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const poolpairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    client.poolpairs.list(50).then(pairs => {
      dispatch(wallet.actions.setPoolPairs(pairs.map(data => ({ type: 'available', data: data }))))
    })
    .catch(logger.error)
  }, [address, blocks])
  return poolpairs
}
