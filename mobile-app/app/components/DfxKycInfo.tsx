import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'
import { translate } from '@translations'
import { useState } from 'react'

import { StyleProp, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { InfoText } from './InfoText'
import { ThemedActivityIndicator } from '@components/themed'
import { tailwind } from '@tailwind'

interface DfxKycInfoProps {
  style?: StyleProp<ViewStyle>
}

export function DfxKycInfo (props: DfxKycInfoProps): JSX.Element {
const { openKycLink } = useDFXAPIContext()
const [isLoadingKyc, setIsLoadingKyc] = useState(false)

  return (
    <TouchableOpacity
      onPress={async () => {
        setIsLoadingKyc(true)
        openKycLink().finally(() => setIsLoadingKyc(false))
      }}
    >
      <InfoText
        testID='dfx_kyc_info'
        text={translate('components/DfxKycInfo', 'Your account needs to get verified once your daily transaction volume exceeds 900 € per day.  If you want to increase daily trading limit, please complete our KYC (Know-Your-Customer) process.')}
        style={props.style}
      />
      {(isLoadingKyc) && <ThemedActivityIndicator size='large' color='#65728a' style={tailwind('absolute inset-0 items-center justify-center')} />}
    </TouchableOpacity>
  )
}
