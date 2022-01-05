import { translate } from '@translations'
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
        lhs={translate('components/ConversionDetailsRow', 'Resulting UTXO')}
        rhs={{
          value: props.utxoBalance,
          testID: 'resulting_utxo_balance'
        }}
      />
      <NumberRow
        lhs={translate('components/ConversionDetailsRow', 'Resulting Tokens')}
        rhs={{
          value: props.tokenBalance,
          testID: 'resulting_token_balance'
        }}
      />
    </>
  )
}
