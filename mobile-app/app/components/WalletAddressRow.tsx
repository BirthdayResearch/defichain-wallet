import { useWalletContext } from '@shared-contexts/WalletContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { TextRow } from './TextRow'

export function WalletAddressRow (): JSX.Element {
  const { address } = useWalletContext()

  return (
    <TextRow
      lhs={translate('components/WalletAddressRow', 'Wallet address')}
      rhs={{
        value: address,
        testID: 'wallet_address_text',
        numberOfLines: 1,
        ellipsizeMode: 'middle'
      }}
      textStyle={tailwind('text-sm font-normal')}
    />
  )
}
