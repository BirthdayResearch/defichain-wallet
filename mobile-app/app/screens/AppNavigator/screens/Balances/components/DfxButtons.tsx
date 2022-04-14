import * as React from 'react'
import { tailwind } from '@tailwind'
import { StyleSheet, ImageSourcePropType, Linking, TouchableOpacity, TouchableOpacityProps, Image, View } from 'react-native'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { getEnvironment } from '@environment'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import * as Updates from 'expo-updates'

import BtnGatewayEn from '@assets/images/dfx_buttons/btn_gateway_en.png'
import BtnOverviewEn from '@assets/images/dfx_buttons/btn_overview_en.png'
import BtnTaxEn from '@assets/images/dfx_buttons/btn_tax_en.png'
import BtnDobbyEn from '@assets/images/dfx_buttons/btn_dobby_en.png'

import BtnGatewayDe from '@assets/images/dfx_buttons/btn_gateway_de.png'
import BtnOverviewDe from '@assets/images/dfx_buttons/btn_overview_de.png'
import BtnTaxDe from '@assets/images/dfx_buttons/btn_tax_de.png'
import BtnDobbyDe from '@assets/images/dfx_buttons/btn_dobby_de.png'

import BtnGatewayFr from '@assets/images/dfx_buttons/btn_gateway_fr.png'
import BtnOverviewFr from '@assets/images/dfx_buttons/btn_overview_fr.png'
import BtnTaxFr from '@assets/images/dfx_buttons/btn_tax_fr.png'
import BtnDobbyFr from '@assets/images/dfx_buttons/btn_dobby_fr.png'

import BtnGatewayIt from '@assets/images/dfx_buttons/btn_gateway_it.png'
import BtnOverviewIt from '@assets/images/dfx_buttons/btn_overview_it.png'
import BtnTaxIt from '@assets/images/dfx_buttons/btn_tax_it.png'
import BtnDobbyIt from '@assets/images/dfx_buttons/btn_dobby_it.png'

import BtnGatewayEs from '@assets/images/dfx_buttons/btn_gateway_es.png'
import BtnOverviewEs from '@assets/images/dfx_buttons/btn_overview_es.png'
import BtnTaxEs from '@assets/images/dfx_buttons/btn_tax_es.png'
import BtnDobbyEs from '@assets/images/dfx_buttons/btn_dobby_es.png'
import { useCallback } from 'react'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'

export function DfxButtons (): JSX.Element {
  const { address } = useWalletContext()
  const { language } = useLanguageContext()
  const { dfxToken } = useDFXAPIContext()

  const onGatewayButtonPress = useCallback(async () => {
    await dfxToken().then(async (token) => {
      const baseUrl = getEnvironment(Updates.releaseChannel).dfxPaymentUrl
      const url = `${baseUrl}/login?token=${token}`
      await Linking.openURL(url)
    })
      .catch(reason => {
 throw new Error(reason)
})
  }, [dfxToken])

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

  const buttons: Array<{hide?: boolean, img: {[key: string]: ImageSourcePropType}, onPress: () => Promise<void>}> = [
    {
      img: {
        de: BtnGatewayDe,
        en: BtnGatewayEn,
        fr: BtnGatewayFr,
        it: BtnGatewayIt,
        es: BtnGatewayEs
      },
      onPress: onGatewayButtonPress
    },
    {
      img: {
        de: BtnOverviewDe,
        en: BtnOverviewEn,
        fr: BtnOverviewFr,
        it: BtnOverviewIt,
        es: BtnOverviewEs
      },
      onPress: onOverviewButtonPress
    },
    {
      img: {
        de: BtnTaxDe,
        en: BtnTaxEn,
        fr: BtnTaxFr,
        it: BtnTaxIt,
        es: BtnTaxEs
      },
      onPress: onTaxButtonPress
    },
    {
      hide: true, // TODO(davidleomay)
      img: {
        de: BtnDobbyDe,
        en: BtnDobbyEn,
        fr: BtnDobbyFr,
        it: BtnDobbyIt,
        es: BtnDobbyEs
      },
      onPress: onDobbyButtonPress
    }
  ]

  return (
    <View style={tailwind('flex flex-row mt-3 px-10 mx-1')}>
      {buttons.filter((b) => !(b.hide ?? false)).map((b, i) => <ImageButton key={i} source={b.img[language] ?? b.img.en} onPress={async () => await b.onPress()} />)}
    </View>
  )
}

interface ImageButtonProps extends TouchableOpacityProps {
    source: ImageSourcePropType
  }

export function ImageButton (props: ImageButtonProps): JSX.Element {
  const styles = StyleSheet.create({
    button: {
      aspectRatio: 1.235, // 1.5, // TODO(davidleomay)
      flex: 1
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
