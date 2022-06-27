import { Dimensions, Image, ImageSourcePropType, Platform } from 'react-native'
import SwiperFlatList from 'react-native-swiper-flatlist'
import ImageA from '@assets/images/onboarding/welcome-screen-c-dark.png'
import ImageB from '@assets/images/onboarding/welcome-screen-b-dark.png'
import ImageC from '@assets/images/onboarding/welcome-screen-a-dark.png'
import ImageD from '@assets/images/onboarding/welcome-screen-d-dark.png'
import ImageALight from '@assets/images/onboarding/welcome-screen-a-light.png'
import ImageBLight from '@assets/images/onboarding/welcome-screen-b-light.png'
import ImageCLight from '@assets/images/onboarding/welcome-screen-c-light.png'
import ImageDLight from '@assets/images/onboarding/welcome-screen-d-light.png'
import { View } from '@components/index'
import { ThemedText } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

interface CarouselImage {
  image: ImageSourcePropType
  imageLight: ImageSourcePropType
  title: string
  subtitle: string
}

const slides: JSX.Element[] = [
  <ImageSlide
    image={ImageA}
    imageLight={ImageALight}
    key={0}
    subtitle='DeFiChain Wallet is fully non-custodial. Only you will have access to your fund.'
    title='Take full control'
  />,
  <ImageSlide
    image={ImageB}
    imageLight={ImageBLight}
    key={1}
    subtitle='Review your available and locked assets in your portfolio.'
    title='View your assets in one place'
  />,
  <ImageSlide
    image={ImageC}
    imageLight={ImageCLight}
    key={2}
    subtitle='Trade on the DEX and earn rewards from liquidity mining with crypto and dTokens.'
    title='Maximize earning potential'
  />,

  <ImageSlide
    image={ImageD}
    imageLight={ImageDLight}
    key={3}
    subtitle='Access financial opportunities with dTokens minted through decentralized vaults.'
    title='Decentralized loans'
  />]

// Needs for it to work on web. Otherwise, it takes full window size
const { width } = Platform.OS === 'web' ? { width: '375px' } : Dimensions.get('window')

export function ImageSlide ({ image, imageLight, title, subtitle }: CarouselImage): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <View style={tailwind('flex-1 items-center justify-center py-8 px-10')}>
      <Image
        source={isLight ? imageLight : image}
        style={{ width: 200, height: 136 }}
      />
      <View style={tailwind('h-2/6 items-center justify-center')}>
        <ThemedText
          style={tailwind('text-xl font-semibold text-center mt-8')}
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
        >
          {translate('screens/OnboardingCarousel', title)}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          style={tailwind('font-normal text-center mt-2 mb-8')}
        >
          {translate('screens/OnboardingCarousel', subtitle)}
        </ThemedText>
      </View>
    </View>
  )
}

export function OnboardingCarouselV2 (): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={30}
      autoplayLoop
      autoplayLoopKeepAnimation
      data={slides}
      index={0}
      paginationActiveColor={isLight ? '#121212' : '#F2F2F2'}
      paginationStyleItemActive={tailwind('w-6 h-1.5')}
      paginationDefaultColor={isLight ? '#737373' : '#8C8C8C'}
      paginationStyleItem={tailwind('h-1.5 w-1.5 mx-1.5')}
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
