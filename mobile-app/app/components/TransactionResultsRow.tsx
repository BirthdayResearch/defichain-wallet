import { translate } from '@translations'

import { NumberRow } from './NumberRow'
import { ThemedSectionTitle } from './themed'

interface TransactionResultsRowProps {
  tokens: TransactionResultsToken[]
}

interface TransactionResultsToken {
  symbol: string
  value: string
  suffix?: string
  testID?: string
}

export function TransactionResultsRow (props: TransactionResultsRowProps): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        testID='title_transaction_results'
        text={translate('components/TransactionResultsRow', 'TRANSACTION RESULTS')}
      />
      {
        props.tokens.map((token, index) => (
          <NumberRow
            key={index}
            lhs={translate('components/TransactionResultsRow', 'Resulting {{symbol}}', { symbol: token.symbol })}
            rhs={{
              value: token.value,
              testID: token.testID ?? `resulting_${token.symbol}`,
              suffixType: 'text',
              suffix: token.suffix
            }}
          />
        ))
      }
    </>
  )
}
