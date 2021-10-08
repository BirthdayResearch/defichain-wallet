import { translate } from '@translations'
import React from 'react'
import { NumberRow } from './NumberRow'
import { ThemedSectionTitle } from './themed'

interface ConversionDetailsRowProps {
  utxoBalance: string | number
  tokenBalance: string | number
}

export function ConversionDetailsRow (props: ConversionDetailsRowProps): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        testID='title_conversion_details'
        text={translate('components/ConversionDetailsRow', 'CONVERSION DETAILS')}
      />
      <NumberRow
        lhs={translate('components/ConversionDetailsRow', 'Ending UTXO')}
        rhs={{
          value: props.utxoBalance,
          testID: 'ending_utxo_balance'
        }}
      />
      <NumberRow
        lhs={translate('components/ConversionDetailsRow', 'Ending Tokens')}
        rhs={{
          value: props.tokenBalance,
          testID: 'ending_token_balance'
        }}
      />
    </>
  )
}
