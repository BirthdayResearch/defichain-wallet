import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { poolPairSelector } from '@store/wallet'
import { useSelector } from 'react-redux'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'PoolPairDetailsScreen'>

export function PoolPairDetailsScreen ({ route }: Props): JSX.Element {
  const { id } = route.params
  const poolPair = useSelector((state: RootState) => poolPairSelector(state.wallet, id))

  if (poolPair === undefined) {
    return <></>
  }

  return (
    <></>
  )
}
