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
import BtnSell from '@assets/images/dfx_buttons/btn_sell.png'

import BtnOverview from '@assets/images/dfx_buttons/btn_income.png'
import BtnTax from '@assets/images/dfx_buttons/btn_tax.png'
import BtnDobby from '@assets/images/dfx_buttons/btn_dobby.png'
import { ThemedView } from '@components/themed'
import { BalanceParamList } from '../BalancesNavigator'

export function DfxButtons (): JSX.Element {
  const { address } = useWalletContext()
  const { language } = useLanguageContext()
  const { openDfxServices } = useDFXAPIContext()
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

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
        en: BtnSell
      },
      onPress: () => navigation.navigate('Sell')
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
      <View style={tailwind('flex-1')} />
      {buttons
        .filter((b) => !(b.hide ?? false))
        .map((b, i) => (i === 2)
          ? (
            <>
              <ThemedView
                light={tailwind('border-gray-100')}
                dark={tailwind('border-dfxblue-800')}
                style={tailwind('h-5/6 border-r')}
              />
              <ImageButton key={i} source={b.img[language] ?? b.img.en} onPress={async () => await b.onPress()} />
            </>
            )
          : <ImageButton key={i} source={b.img[language] ?? b.img.en} onPress={async () => await b.onPress()} />
      )}
      <View style={tailwind('flex-1')} />
    </View>
  )
}

interface ImageButtonProps extends TouchableOpacityProps {
  source: ImageSourcePropType
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
    </TouchableOpacity>
  )
}
