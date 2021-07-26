import * as React from 'react'
import { Dimensions, Image, ImageSourcePropType, Platform, TouchableOpacity } from 'react-native'
import SwiperFlatList from 'react-native-swiper-flatlist'
import { MnemonicUnprotected } from '../../../../api/wallet/provider/mnemonic_unprotected'
import ImageA from '../../../../assets/images/onboarding/a.png'
import ImageB from '../../../../assets/images/onboarding/b.png'
import ImageC from '../../../../assets/images/onboarding/c.png'
import { Text, View } from '../../../../components'
import { AppIcon } from '../../../../components/icons/AppIcon'
import { useWalletManagementContext } from '../../../../contexts/WalletManagementContext'
import { getEnvironment } from '../../../../environment'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'

interface CarouselImage {
  image: ImageSourcePropType
  title: string
  subtitle: string
}

const slides: JSX.Element[] = [<InitialSlide key={0} />,
  <ImageSlide
    key={1}
    image={ImageA} title='Take full control of your digital assets'
    subtitle='Nobody owns your keys and wallet except you'
  />,
  <ImageSlide
    key={2}
    image={ImageB} title='Unlock the highest potential of your finances'
    subtitle='Transact, liquidity mine, swap and many more features as a fully-decentralized wallet'
  />,
  <ImageSlide
    key={3}
    image={ImageC} title='Earn high yields of up to 90% with DEX'
    subtitle='Supply liquidity to BTC, ETH, and many other pool pairs. You can also withdraw anytime!'
  />]

// Needs for it to work on web. Otherwise, it takes full window size
const { width } = Platform.OS === 'web' ? { width: '375px' } : Dimensions.get('window')

export function InitialSlide (): JSX.Element {
  const { setWallet } = useWalletManagementContext()
  const onDebugPress = getEnvironment().debug ? async () => {
    await setWallet(MnemonicUnprotected.Abandon23Playground)
  } : undefined
  return (
    <View style={tailwind('flex-1 items-center justify-center p-8')}>
      <TouchableOpacity onPress={onDebugPress}>
        <AppIcon width={100} height={100} />
      </TouchableOpacity>
      <Text style={tailwind('text-2xl font-bold mt-3')}>
        {translate('screens/OnboardingCarousel', 'DeFiChain')}
      </Text>
      <Text style={tailwind('text-base font-light text-gray-500')}>
        {translate('screens/OnboardingCarousel', 'Wallet')}
      </Text>
      <Text style={tailwind('text-lg font-medium mt-6 text-center')}>
        {translate('screens/OnboardingCarousel', 'A wallet dedicated to the native decentralized finance for bitcoin.')}
      </Text>
    </View>
  )
}

export function ImageSlide ({ image, title, subtitle }: CarouselImage): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center py-8 px-5 pt-0')}>
      <Image source={image} style={{ width, height: '60%' }} />
      <Text style={tailwind('text-xl font-bold text-center mt-8')}>
        {translate('screens/OnboardingCarousel', title)}
      </Text>
      <Text style={tailwind('font-normal text-center text-gray-500 mt-3')}>
        {translate('screens/OnboardingCarousel', subtitle)}
      </Text>
    </View>
  )
}

export function OnboardingCarousel (): JSX.Element {
  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={30}
      autoplayLoop
      autoplayLoopKeepAnimation
      index={2}
      showPagination
      data={slides}
      paginationStyleItem={tailwind('h-2.5 w-2.5 mx-1.5')}
      paginationDefaultColor='rgba(0, 0, 0, 0.1)'
      paginationActiveColor='rgba(0, 0, 0, 0.8)'
      renderItem={({ item }) => (
        <View style={{ width }}>
          {
            item
          }
        </View>
      )}
    />
  )
}
