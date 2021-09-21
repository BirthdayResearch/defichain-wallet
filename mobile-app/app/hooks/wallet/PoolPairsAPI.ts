import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../../api'
import { useWalletContext } from '../../contexts/WalletContext'
import { useWhaleApiClient } from '../../contexts/WhaleContext'
import { RootState } from '../../store'
import { DexItem, wallet } from '../../store/wallet'

export function usePoolPairsAPI (): DexItem[] {
  const client = useWhaleApiClient()
  const poolpairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    client.poolpairs.list(50).then(pairs => {
      dispatch(wallet.actions.setPoolPairs(pairs.map(data => ({ type: 'available', data: data }))))
    }).catch((err) => {
      Logging.error(err)
    })
  }, [address, blocks])
  return poolpairs
}
