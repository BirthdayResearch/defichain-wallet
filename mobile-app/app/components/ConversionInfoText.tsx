import { translate } from '@translations'
import { StyleProp, ViewStyle } from 'react-native'
import { InfoText } from './InfoText'

interface ConversionInfoTextProps {
  style?: StyleProp<ViewStyle>
}

export function ConversionInfoText (props: ConversionInfoTextProps): JSX.Element {
  return (
    <InfoText
      testID='conversion_info_text'
      text={translate('components/ConversionInfoText', 'Conversion will be required. Your passcode will be asked to authorize both transactions.')}
      style={props.style}
    />
  )
}
