import { translate } from '@translations'

import { StyleProp, ViewStyle } from 'react-native'
import { InfoText } from './InfoText'

interface ReservedDFIInfoTextProps {
  style?: StyleProp<ViewStyle>
}

export function ReservedDFIInfoText (props: ReservedDFIInfoTextProps): JSX.Element {
  return (
    <InfoText
      testID='reserved_info_text'
      text={translate('components/ReservedDFIInfoText', 'A small UTXO amount (0.1 DFI) is reserved for fees.')}
      style={props.style}
    />
  )
}
