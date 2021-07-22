import React from 'react'
import { PinInput } from '../../../components/PinInput'

// type Props = StackScreenProps<WalletParamList, 'PinCreation'>

export function PinInputScreen (): JSX.Element {
  return (
    <PinInput
      length={6}
      onChange={(val: string) => { console.log(val) }}
    />
  )
}
