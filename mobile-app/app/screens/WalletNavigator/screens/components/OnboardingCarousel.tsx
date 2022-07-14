import * as React from 'react'
import { Dimensions, Image, ImageSourcePropType, Platform } from 'react-native'
import SwiperFlatList from 'react-native-swiper-flatlist'
import ImageA from '@assets/images/onboarding/a.png'
import ImageB from '@assets/images/onboarding/b.png'
import ImageC from '@assets/images/onboarding/c.png'
import { View } from '@components/index'
import { AppIcon } from '@components/icons/AppIcon'
import { ThemedText } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { theme } from '../../../../tailwind.config'
import { translate } from '@translations'
import { VersionTag } from '@components/VersionTag'

interface CarouselImage {
  image: ImageSourcePropType
  title: string
  secondTitle?: string
  subtitle: string
}

const slides: JSX.Element[] = [<InitialSlide key={0} />,
  <ImageSlide
    image={ImageA}
    key={1}
    subtitle='DeFiChain Wallet is fully non-custodial. Keep your 24-word recovery phrase safe. Only you have access to your funds.'
    title='Take full control'
  />,
  <ImageSlide
    image={ImageB}
    key={2}
    subtitle='Review your available and locked assets in your portfolio.'
    title='View your assets in one place'
  />,
  <ImageSlide
    image={ImageC}
    key={3}
    subtitle='Trade on the DEX and earn rewards from liquidity mining with crypto and dTokens.'
    title='Maximize earning potential'
  />]

// Needs for it to work on web. Otherwise, it takes full window size
const { width } = Platform.OS === 'web' ? { width: '375px' } : Dimensions.get('window')

export function InitialSlide (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center p-8')}>
      <AppIcon width={150} height={100} />
      <ThemedText style={tailwind('text-2xl font-bold')}>
        {translate('screens/OnboardingCarousel', 'Wallet')}
      </ThemedText>

      <ThemedText
        light={tailwind('text-dfxgray-500')}
        dark={tailwind('text-dfxgray-400')}
        style={tailwind('text-center font-medium mt-10')}
      >
        {translate('screens/OnboardingCarousel', 'A wallet dedicated to the native decentralized finance for bitcoin.')}
      </ThemedText>

      <View style={tailwind('mt-2')}>
        <VersionTag />
      </View>
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

        {secondTitle !== undefined && (
          <ThemedText style={tailwind('text-2xl font-bold text-center')}>
            {translate('screens/OnboardingCarousel', secondTitle)}
          </ThemedText>
        )}

        <ThemedText
          dark={tailwind('text-dfxgray-400')}
          light={tailwind('text-dfxgray-500')}
          style={tailwind('font-normal text-center mt-1 mb-8')}
        >
          {translate('screens/OnboardingCarousel', subtitle)}
        </ThemedText>
      </View>

      <Image
        source={image}
        style={{ width, height: '55%' }}
      />
    </View>
  )
}

export function OnboardingCarousel (): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={30}
      autoplayLoop
      autoplayLoopKeepAnimation
      data={slides}
      index={0}
      paginationActiveColor={isLight ? 'rgba(0, 0, 0, 0.8)' : '#FFFFFF'}
      paginationDefaultColor={isLight ? 'rgba(0, 0, 0, 0.1)' : theme.extend.colors.dfxgray[500]}
      paginationStyleItem={tailwind('h-2.5 w-2.5 mx-1.5')}
      renderItem={({ item }) => (
        <View style={{ width }}>
          {
            item
          }
        </View>
      )}
      showPagination
    />
  )
}
