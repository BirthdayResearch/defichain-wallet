import * as React from 'react'
import { Dimensions, Platform } from 'react-native'
import SwiperFlatList from 'react-native-swiper-flatlist'
import SvgA from '@assets/images/onboarding/a.svg'
import SvgB from '@assets/images/onboarding/b.svg'
import SvgC from '@assets/images/onboarding/c.svg'
import SvgD from '@assets/images/onboarding/d.svg'
import { View } from '@components/index'
import { AppIcon } from '@components/icons/AppIcon'
import { ThemedText } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { theme } from '../../../../tailwind.config'
import { translate } from '@translations'
import { VersionTag } from '@components/VersionTag'
import { SvgProps } from 'react-native-svg'
import { FC } from 'react'

interface CarouselImage {
  Component: FC<SvgProps>
  title: string
  secondTitle?: string
  subtitle: string
}

const slides: JSX.Element[] = [<InitialSlide key={0} />,
  <ImageSlide
    Component={SvgA}
    key={1}
    subtitle='By creating your own wallet, you get access to the DeFiChain protocol and to the service of DFX.'
    title='Create your own Wallet.'
  />,
  <ImageSlide
    Component={SvgB}
    key={2}
    subtitle='Through liquidity mining or staking applications you can earn cashflow by letting your investment work for you.'
    title='Buy and Sell DeFi Tokens.'
  />,
  <ImageSlide
    Component={SvgC}
    key={3}
    subtitle='Trade on the DEX and earn rewards from liquidity mining with crypto and dTokens.'
    title='Generate passive cashflow.'
  />,
  <ImageSlide
    Component={SvgD}
    key={4}
    subtitle='You can easily document all of your transactions and rewards through our 1-click solution enabled by an API to Cointracking.'
    title='Track your tax.'
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

export function ImageSlide ({ Component, title, secondTitle, subtitle }: CarouselImage): JSX.Element {
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

      <Component />
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
