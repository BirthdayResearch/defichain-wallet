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
    <TouchableOpacity>
      <InfoText
        testID='dfx_kyc_info'
        text={translate('components/DfxKYCInfo', 'For transfers over 900€ per day must complete the KYC (know your customer) process. If you like to lift that limit complete the KYC process here.')}
        style={props.style}
        onPress={async () => await openDfxServices()}
      />
    </TouchableOpacity>
  )
}
