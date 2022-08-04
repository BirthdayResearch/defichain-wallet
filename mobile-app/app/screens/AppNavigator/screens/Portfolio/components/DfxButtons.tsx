import * as React from 'react'
import { tailwind } from '@tailwind'
import { StyleSheet, Linking, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'

import DfxIcon from '@assets/images/dfx_buttons/buttons/DFX_Icon.svg'
import SellIcon from '@assets/images/dfx_buttons/buttons/Sell_Icon.svg'
import BtcIcon from '@assets/images/dfx_buttons/crypto/Bitcoin_icon.svg'
import DefichainIncomeIcon from '@assets/images/dfx_buttons/buttons/Defichain_Income_Icon.svg'
import DFItaxIcon from '@assets/images/dfx_buttons/buttons/DFItax_Icon.svg'

// import BtnDobby from '@assets/images/dfx_buttons/btn_dobby.png'

import { ThemedActivityIndicator, ThemedText } from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { useState } from 'react'
import { getUserDetail } from '@shared-api/dfx/ApiService'
import { DFXPersistence } from '@api/persistence/dfx_storage'
import { CryptoButtonGroupTabKey } from '../screens/ReceiveDTokenScreen'
import { SvgProps } from 'react-native-svg'
import { translate } from '@translations'

export function DfxButtons (): JSX.Element {
  const { address } = useWalletContext()
  const { openDfxServices } = useDFXAPIContext()
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()

  const [isLoadingKycInfo, setIsLoadingKycInfo] = useState<boolean>()

  async function onOverviewButtonPress (): Promise<void> {
    const url = `https://defichain-income.com/address/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  async function onTaxButtonPress (): Promise<void> {
    const url = `https://dfi.tax/adr/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  async function onDobbyButtonPress (): Promise<void> {
    const url = `https://defichain-dobby.com/#/setup/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  // update loading, set isKInfo state & navigate accordingly
  const navigateSell = (isKyc: boolean): void => {
    setIsLoadingKycInfo(false)
    isKyc ? navigation.navigate('Sell') : navigation.navigate('UserDetails')
  }

  function checkUserProfile (): void {
    // start loading UserInfoCompleted/KycDataComplete --> (1) from STORE --> (2) from API + store result
    setIsLoadingKycInfo(true)

    void (async () => {
      // (1) from STORE
      const isUserDetailStored = await DFXPersistence.getUserInfoComplete(address)

      if (isUserDetailStored !== null && isUserDetailStored) {
        // if stored, navigate to Sell Screen
        navigateSell(true)
      } else {
        // if not, retrieve from API
        void (async () => {
          // (2) from API
          const userDetail = await getUserDetail()
          userDetail.kycDataComplete = userDetail?.kycDataComplete ?? false

          // persist result to STORE
          await DFXPersistence.setUserInfoComplete(address, userDetail.kycDataComplete)

          // navigate based on BackendData result
          navigateSell(userDetail.kycDataComplete)
        })()
      }
    })()
  }

  const buttons: Array<{ hide?: boolean, Svg: React.FC<SvgProps>, label: string, onPress: () => Promise<void>|void }> = [
    {
      Svg: DfxIcon,
      label: translate('screens/DfxButtons', 'Buy & Staking'),
      onPress: openDfxServices
    },
    {
      Svg: SellIcon,
      label: translate('screens/DfxButtons', 'Sell'),
      onPress: () => {
        // check kycData
        checkUserProfile()
      }
    },
    {
      Svg: BtcIcon,
      label: translate('screens/DfxButtons', 'Deposit Bitcoin'),
      onPress: () => {
        // TODO: (thabrad) maybe will need to do kycCheck here in future
        navigation.navigate({
          name: 'ReceiveDTokenScreen',
          params: { crypto: CryptoButtonGroupTabKey.BTC },
          merge: true
        })
      }
    },
    {
      Svg: DefichainIncomeIcon,
      label: translate('screens/DfxButtons', 'Defichain Income'),
      onPress: onOverviewButtonPress
    },
    {
      Svg: DFItaxIcon,
      label: translate('screens/DfxButtons', 'DFI.Tax'),
      onPress: onTaxButtonPress
    },
    {
      hide: true, // TODO(davidleomay)
      Svg: DFItaxIcon,
      label: translate('screens/DfxButtons', 'Dobby'),
      onPress: onDobbyButtonPress
    }
  ]

  return (
    <View style={tailwind('flex justify-center flex-row mt-3')}>
      <View style={tailwind('flex w-2')} />
      {buttons
        .filter((b) => !(b.hide ?? false))
        .map((b, i) => (b.Svg === SellIcon) // loading spinner when loading userInfo
          ? (
            <SvgButton key={i} Svg={b.Svg} label={b.label} onPress={async () => await b.onPress()} loading={isLoadingKycInfo} />
          )
          : <SvgButton key={i} Svg={b.Svg} label={b.label} onPress={async () => await b.onPress()} />
      )}
      <View style={tailwind('flex w-2')} />
    </View>
  )
}

interface SvgButtonProps extends TouchableOpacityProps {
  Svg: React.FC<SvgProps>
  label?: string
  // source: ImageSourcePropType
  loading?: boolean
}

export function SvgButton (props: SvgButtonProps): JSX.Element {
  const styles = StyleSheet.create({
    button: {
      aspectRatio: 1,
      flex: 2
    }
  })

  return (
    <TouchableOpacity style={styles.button} {...props}>
      <View style={tailwind('justify-center items-center')}>
        <props.Svg width={54} height={54} />
        <ThemedText
          style={tailwind('h-8 mt-1 text-center text-xs')}
        >
          {props.label}
        </ThemedText>
      </View>
      {(props.loading ?? false) && <ThemedActivityIndicator size='large' color='#65728a' style={tailwind('absolute inset-0 items-center justify-center')} />}
    </TouchableOpacity>
  )
}
