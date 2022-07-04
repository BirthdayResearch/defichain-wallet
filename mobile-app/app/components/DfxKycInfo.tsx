import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'
import { translate } from '@translations'

import { StyleProp, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { InfoText } from './InfoText'

interface DfxKycInfoProps {
  style?: StyleProp<ViewStyle>
}

export function DfxKycInfo (props: DfxKycInfoProps): JSX.Element {
const { openDfxServices } = useDFXAPIContext()
  return (
    <TouchableOpacity
      onPress={async () => await openDfxServices()}
    >
      <InfoText
        testID='dfx_kyc_info'
        text={translate('components/DfxKycInfo', 'Your account needs to get verified once your daily transaction volume exceeds 900 € per day.  If you want to increase daily trading limit, please complete our KYC (Know-Your-Customer) process.')}
        style={props.style}
      />
    </TouchableOpacity>
  )
}
