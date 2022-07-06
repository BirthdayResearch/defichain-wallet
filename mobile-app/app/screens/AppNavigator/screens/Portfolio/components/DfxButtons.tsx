import * as React from 'react'
import { tailwind } from '@tailwind'
import { StyleSheet, ImageSourcePropType, Linking, TouchableOpacity, TouchableOpacityProps, Image, View } from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'

import BtnDfxEn from '@assets/images/dfx_buttons/btn_dfx_en.png'
import BtnDfxDe from '@assets/images/dfx_buttons/btn_dfx_de.png'
import BtnDfxFr from '@assets/images/dfx_buttons/btn_dfx_fr.png'
import BtnDfxIt from '@assets/images/dfx_buttons/btn_dfx_it.png'
import BtnDfxEs from '@assets/images/dfx_buttons/btn_dfx_es.png'

import BtnSellEn from '@assets/images/dfx_buttons/btn_sell_EN.png'
import BtnSellDe from '@assets/images/dfx_buttons/btn_sell.png'
import BtnSellFr from '@assets/images/dfx_buttons/btn_sell_FR.png'
import BtnSellIt from '@assets/images/dfx_buttons/btn_sell_IT.png'
import BtnSellEs from '@assets/images/dfx_buttons/btn_sell_ES.png'

import BtnOverview from '@assets/images/dfx_buttons/btn_income.png'
import BtnTax from '@assets/images/dfx_buttons/btn_tax.png'
import BtnDobby from '@assets/images/dfx_buttons/btn_dobby.png'
import { ThemedActivityIndicator, ThemedView } from '@components/themed'
import { PortfolioParamList } from '../PortfolioNavigator'
import { useState } from 'react'
import { getUserDetail } from '@shared-api/dfx/ApiService'
import { DFXPersistence } from '@api/persistence/dfx_storage'

export function DfxButtons (): JSX.Element {
  const { address } = useWalletContext()
  const { language } = useLanguageContext()
  const { openDfxServices } = useDFXAPIContext()
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  /**
     * 3 Status for @param loadKycInfo / @param setLoadKycInfo:
     * (1) undefined --> status not yet retrieved
     * (2) true --> retrieving from Store (or API) --> result to STORE + isKycInfo
     * (3) false --> retrieved from Store (or API) --> check result
     * @returns boolean
     */
  const [loadKycInfo, setLoadKycInfo] = useState<boolean>()
  const [isKycInfo, setIsKycInfo] = useState<boolean>(false)

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
    setLoadKycInfo(false)
    setIsKycInfo(isKyc)
    isKyc ? navigation.navigate('Sell') : navigation.navigate('UserDetails')
  }

  function checkUserProfile (): void {
    // start loading UserInfoCompleted --> (1) from STORE --> (2) from API + store result
    setLoadKycInfo(true)

    void (async () => {
      // (1) from STORE
      const isUserDetailStored = await DFXPersistence.getUserInfoComplete()

      if (isUserDetailStored !== null && isUserDetailStored) {
        // if stored navigate to Sell Screen
        navigateSell(true)
      } else {
        // if not, retrieve from API
        void (async () => {
          // (2) from API
          const userdetail = await getUserDetail()
          // persist result to STORE
          await DFXPersistence.setUserInfoComplete(userdetail.kycDataComplete)
          // navigate based on BackendData result
          navigateSell(userdetail.kycDataComplete)
        })()
      }
    })()
  }

  const buttons: Array<{ hide?: boolean, img: { [key: string]: ImageSourcePropType }, onPress: () => Promise<void>|void }> = [
    {
      img: {
        de: BtnDfxDe,
        en: BtnDfxEn,
        fr: BtnDfxFr,
        it: BtnDfxIt,
        es: BtnDfxEs
      },
      onPress: openDfxServices
    },
    {
      img: {
        en: BtnSellEn,
        de: BtnSellDe,
        fr: BtnSellFr,
        it: BtnSellIt,
        es: BtnSellEs
      },
      onPress: () => {
        // check kyc on app start
        if (loadKycInfo === undefined) {
          checkUserProfile()
          return
        }

        // check cache
        if (isKycInfo) {
          navigateSell(true)
          return
        }

        // if false: re-check (STORE), if kyc true: proceed to sell
        if (!isKycInfo) {
          // check if kyc status has changed meanwhile
          void (async () => {
            const isUserDetailStored = await DFXPersistence.getUserInfoComplete()
            if (isUserDetailStored !== null) {
              // if stored navigate to Sell Screen
              navigateSell(isUserDetailStored)
            } else {
              navigateSell(false)
            }
          })()
        }
      }
    },
    {
      img: {
        en: BtnOverview
      },
      onPress: onOverviewButtonPress
    },
    {
      img: {
        en: BtnTax
      },
      onPress: onTaxButtonPress
    },
    {
      hide: true, // TODO(davidleomay)
      img: {
        en: BtnDobby
      },
      onPress: onDobbyButtonPress
    }
  ]

  return (
    <View style={tailwind('flex justify-center flex-row mt-3')}>
      <View style={tailwind('flex w-6')} />
      {buttons
        .filter((b) => !(b.hide ?? false))
        .map((b, i) => (b.img.en === BtnSellEn) // loading spinner when loading userInfo
          ? (
            <ImageButton key={i} source={b.img[language] ?? b.img.en} onPress={async () => await b.onPress()} loading={loadKycInfo} />
          )
          // add divider before/on 3rd button
          : (i === 2)
          ? (
            <React.Fragment key={`f ${i}`}>
              <ThemedView
                light={tailwind('border-gray-100')}
                dark={tailwind('border-dfxblue-800')}
                style={tailwind('h-5/6 border-r')}
                key={`tv ${i}`}
              />
              <ImageButton key={`b ${i}`} source={b.img[language] ?? b.img.en} onPress={async () => await b.onPress()} />
            </React.Fragment>
            )
          : <ImageButton key={i} source={b.img[language] ?? b.img.en} onPress={async () => await b.onPress()} />
      )}
      <View style={tailwind('flex w-6')} />
    </View>
  )
}

interface ImageButtonProps extends TouchableOpacityProps {
  source: ImageSourcePropType
  loading?: boolean
}

export function ImageButton (props: ImageButtonProps): JSX.Element {
  const styles = StyleSheet.create({
    button: {
      aspectRatio: 1,
      flex: 2
    },
    image: {
      height: '100%',
      resizeMode: 'contain',
      width: '100%'
    }
  })

  return (
    <TouchableOpacity style={styles.button} {...props}>
      <Image
        source={props.source}
        style={styles.image}
      />
      {(props.loading ?? false) && <ThemedActivityIndicator size='large' color='#65728a' style={tailwind('absolute inset-0 items-center justify-center')} />}
    </TouchableOpacity>
  )
}
