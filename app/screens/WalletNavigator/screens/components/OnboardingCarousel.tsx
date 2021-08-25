import * as React from 'react'
import { Dimensions, Image, ImageSourcePropType, Platform } from 'react-native'
import SwiperFlatList from 'react-native-swiper-flatlist'
import ImageA from '../../../../assets/images/onboarding/a.png'
import ImageB from '../../../../assets/images/onboarding/b.png'
import ImageC from '../../../../assets/images/onboarding/c.png'
import { View } from '../../../../components'
import { AppIcon } from '../../../../components/icons/AppIcon'
import { ThemedText } from '../../../../components/themed'
import { useThemeContext } from '../../../../contexts/ThemeProvider'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'

interface CarouselImage {
  image: ImageSourcePropType
  title: string
  secondTitle: string
  subtitle: string
}

const slides: JSX.Element[] = [<InitialSlide key={0} />,
  <ImageSlide
    key={1}
    image={ImageA}
    title='Take full control'
    secondTitle='of your digital assets'
    subtitle='Nobody owns your keys and wallet except you.'
  />,
  <ImageSlide
    key={2}
    image={ImageB}
    title='Unlock the highest'
    secondTitle='potential of your finances'
    subtitle='Transact, liquidity mine, swap and many more features as a fully-decentralized wallet'
  />,
  <ImageSlide
    key={3}
    image={ImageC}
    title='Earn high yields'
    secondTitle='of up to 90% with DEX'
    subtitle='Supply liquidity to BTC, ETH, and many other pool pairs. You can also withdraw anytime!'
  />]

// Needs for it to work on web. Otherwise, it takes full window size
const { width } = Platform.OS === 'web' ? { width: '375px' } : Dimensions.get('window')

export function InitialSlide (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center p-8')}>
      <AppIcon width={100} height={100} />
      <ThemedText style={tailwind('text-2xl font-bold mt-3')}>
        {translate('screens/OnboardingCarousel', 'DeFiChain Wallet')}
      </ThemedText>
      <ThemedText light='text-gray-500' dark='text-gray-400' style={tailwind('text-base font-medium mt-1')}>
        {translate('screens/OnboardingCarousel', 'Native DeFi for Bitcoin')}
      </ThemedText>
    </View>
  )
}

export function ImageSlide ({ image, title, secondTitle, subtitle }: CarouselImage): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center py-8 px-5')}>
      <View style={tailwind('h-2/6 items-center justify-center')}>
        <ThemedText style={tailwind('text-2xl font-bold text-center')}>
          {translate('screens/OnboardingCarousel', title)}
        </ThemedText>
        <ThemedText style={tailwind('text-2xl font-bold text-center')}>
          {translate('screens/OnboardingCarousel', secondTitle)}
        </ThemedText>
        <ThemedText light='text-gray-500' dark='text-gray-400' style={tailwind('font-normal text-center mt-1 mb-8')}>
          {translate('screens/OnboardingCarousel', subtitle)}
        </ThemedText>
      </View>
      <Image source={image} style={{ width, height: '55%' }} />
    </View>
  )
}

export function OnboardingCarousel (): JSX.Element {
  const { theme } = useThemeContext()
  const isLight = theme === 'light'
  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={30}
      autoplayLoop
      autoplayLoopKeepAnimation
      index={0}
      showPagination
      data={slides}
      paginationStyleItem={tailwind('h-2.5 w-2.5 mx-1.5')}
      paginationDefaultColor={isLight ? 'rgba(0, 0, 0, 0.1)' : '#262626'}
      paginationActiveColor={isLight ? 'rgba(0, 0, 0, 0.8)' : '#D4D4D4'}
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
