import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'

import { Image, ImageBackground, TouchableOpacity, View } from 'react-native'
import { AppIcon } from '@components/icons/AppIcon'
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedText,
  ThemedTextV2,
  ThemedTouchableOpacity,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { openURL } from '@api/linking'
import { SettingsParamList } from '../SettingsNavigator'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import DeFiChainWalletImageLight from '@assets/images/DeFiChainWallet-light.png'
import DeFiChainWalletImageDark from '@assets/images/DeFiChainWallet-dark.png'
import GridBackgroundImageLight from '@assets/images/onboarding/grid-background-light.png'
import GridBackgroundImageDark from '@assets/images/onboarding/grid-background-dark.png'
import { VersionTagV2 } from '@components/VersionTagV2'

interface AboutScreenLinks {
  testID: string
  title: string
  subtitle: string
  iconName: React.ComponentProps<typeof Feather>['name']
  url?: string
  onPress?: (navigation: any) => void
}

interface AboutScreenSocialLinks {
  testID: string
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  url: string
}

interface AboutLinks {
  testID: string
  title: string
  url: string
}

const MAIN_LINKS: AboutScreenLinks[] = [
  {
    testID: 'community_link',
    title: 'Join our active community',
    subtitle: 'Report in Github, discuss in Reddit and Telegram',
    iconName: 'message-square',
    onPress: (navigation) => navigation.navigate('CommunityScreen')
  },
  {
    testID: 'knowledge_base_link',
    title: 'FAQ',
    subtitle: 'Common questions and support documents',
    iconName: 'book',
    onPress: (navigation) => navigation.navigate('KnowledgeBaseScreen')
  },
  {
    testID: 'explorer_link',
    title: 'DeFi Scan', // "DeFi Scan" does not need to be translated
    subtitle: 'Track transactions, tokens and DEX pairs',
    iconName: 'activity',
    url: 'https://defiscan.live/'
  },
  {
    testID: 'official_website',
    title: 'DeFiChain official website',
    subtitle: 'Learn more about the native decentralized finance for Bitcoin',
    iconName: 'mouse-pointer',
    url: 'https://defichain.com/'
  }
]

const ABOUT_LINKS: AboutLinks[] = [
  {
    testID: 'privacy_policy_button',
    title: 'Privacy Policy',
    url: 'https://defichain.com/privacy-policy/'
  },
  {
    testID: 'licenses_button',
    title: 'Licenses',
    url: 'https://app.fossa.com/projects/git%2Bgithub.com%2FDeFiCh%2Fwallet/refs/branch/main/eefb43ca2933838df8d16ad8c3b2b92db3278843/browse/licenses'
  },
  {
    testID: 'white_paper',
    title: 'White Paper',
    url: 'https://defichain.com/white-paper/'
  }
]

const SOCIAL_LINKS: AboutScreenSocialLinks[] = [
  {
    testID: 'youtube_social',
    iconName: 'youtube',
    url: 'https://www.youtube.com/channel/UCL635AjCJe6gNOD7Awlv4ug'
  },
  {
    testID: 'twitter_social',
    iconName: 'twitter',
    url: 'https://twitter.com/defichain'
  },
  {
    testID: 'reddit_social',
    iconName: 'reddit',
    url: 'https://www.reddit.com/r/defiblockchain'
  },
  {
    testID: 'github',
    iconName: 'github',
    url: 'https://github.com/DeFiCh/wallet'
  }
]

export function AboutScreen (): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const { hasBetaFeatures } = useFeatureFlagContext()
  const { isLight } = useThemeContext()

  return (
    <ThemedScrollViewV2 style={tailwind('flex-1')}>
      <View style={tailwind('flex-1 items-center justify-center mt-12 mb-11')}>
        <AppIcon
          height={52}
          testID='app_logo'
          width={52}
        />

        <Image
          source={isLight ? DeFiChainWalletImageLight : DeFiChainWalletImageDark}
          style={tailwind('flex-wrap w-64 h-6 mt-5')}
          resizeMode='contain'
        />

        <View style={tailwind('mt-3')}>
          <VersionTagV2 />
        </View>

        {hasBetaFeatures && (
          <TouchableOpacity
            testID='try_beta_features'
            onPress={() => navigation.navigate('FeatureFlagScreen')}
          >
            <ThemedText style={tailwind('mt-1 mb-1 text-2xs font-bold-v2 text-black uppercase')}>
              {translate('screens/AboutScreen', 'Try Beta features')}
            </ThemedText>
          </TouchableOpacity>
        )}

        <ImageBackground
          source={isLight ? GridBackgroundImageLight : GridBackgroundImageDark}
          style={tailwind('w-full mt-10 overflow-hidden')}
          resizeMode='cover'
          imageStyle={tailwind('h-56')}
        >
          <View style={tailwind('flex-col mt-16')}>
            <ThemedText
              style={tailwind('text-2xs leading-4 font-normal-v2 uppercase text-center')}
            >
              {translate('screens/AboutScreen', 'Developed by')}
            </ThemedText>
            <ThemedText
              style={tailwind('text-2xs leading-4 font-normal-v2 uppercase text-center')}
            >
              {translate('screens/AboutScreen', 'Birthday Research')}
            </ThemedText>
          </View>

          <View style={tailwind('flex-row justify-center pt-11')}>
            {
              SOCIAL_LINKS.map((link) => (
                <SocialIcon
                  {...link}
                  key={link.testID}
                />
              ))
            }
          </View>
        </ImageBackground>

      </View>

      {
        MAIN_LINKS.map((link) => (
          <LinkItemRow
            {...link}
            key={link.testID}
          />
        ))
      }

      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-500')}
        light={tailwind('text-mono-light-v2-500')}
        style={tailwind('font-normal-v2 text-xs uppercase mt-6 mx-10')}
      >
        {translate('screens/AboutSCreen', 'Other information')}
      </ThemedTextV2>
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('flex-col rounded-lg mx-5 mt-2')}
      >
        {
          ABOUT_LINKS.map((link, index) => (
            <AboutLinkItem
              link={link}
              key={link.testID}
              border={index < ABOUT_LINKS.length - 1}
            />
          ))
        }
      </ThemedViewV2>

      <View style={tailwind('items-center my-12 mx-10')}>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-500')} light={tailwind('text-mono-light-v2-500')}
          style={tailwind('font-normal-v2 text-xs font-normal text-center')}
        >
          {translate('screens/CommunityScreen', 'DeFiChain is a community-driven and open project.')}
        </ThemedTextV2>

        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-500')} light={tailwind('text-mono-light-v2-500')}
          style={tailwind('font-normal-v2 text-xs font-normal text-center')}
        >
          {translate('screens/CommunityScreen', 'The DeFiChain Foundation does not provide direct support.')}
        </ThemedTextV2>
      </View>
    </ThemedScrollViewV2>
  )
}

function LinkItemRow ({
  title,
  subtitle,
  testID,
  url,
  onPress,
  iconName
}: AboutScreenLinks): JSX.Element {
  const navigation = useNavigation()
  const handlePress = async (): Promise<void> => {
    if (onPress !== undefined) {
      onPress(navigation)
    } else if (url !== undefined) {
      await openURL(url)
    }
  }

  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
      onPress={handlePress}
      style={tailwind('flex-row px-5 py-4 items-center rounded-lg mb-2 mx-5')}
      testID={testID}
    >
      <View style={tailwind('flex-col flex-1 mr-8')}>
        <ThemedTextV2
          style={tailwind('font-semibold-v2 text-sm flex-wrap')}
        >
          {translate('screens/AboutScreen', title)}
        </ThemedTextV2>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-700')}
          light={tailwind('text-mono-light-v2-700')}
          style={tailwind('font-normal-v2 text-sm flex-wrap pt-px')}
        >
          {translate('screens/AboutScreen', subtitle)}
        </ThemedTextV2>
      </View>
      <ThemedIcon
        dark={tailwind('text-mono-dark-v2-700')}
        light={tailwind('text-mono-light-v2-700')}
        iconType='Feather'
        name={iconName}
        size={20}
      />
    </ThemedTouchableOpacity>
  )
}

function SocialIcon ({
  iconName,
  url,
  testID
}: AboutScreenSocialLinks): JSX.Element {
  const handlePress = async (): Promise<void> => {
    await openURL(url)
  }

  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-gray-100')}
      light={tailwind('bg-gray-900')}
      onPress={handlePress}
      style={tailwind('justify-center items-center rounded-full w-10 h-10 mx-4')}
      testID={testID}
    >
      <ThemedIcon
        dark={tailwind('text-black')}
        light={tailwind('text-white')} style={tailwind('text-gray-100 pl-px')}
        iconType='MaterialCommunityIcons' name={iconName} size={24}
      />
    </ThemedTouchableOpacity>
  )
}

function AboutLinkItem ({
  link,
  border
}: { link: AboutLinks, border: boolean }): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      testID={link.testID}
      style={tailwind('flex-row py-5 mx-5', { 'border-b-0.5': border })}
      onPress={async () => await openURL(link.url)} key={link.testID}
    >
      <ThemedTextV2
        style={tailwind('flex-1 font-normal-v2 text-sm')}
      >
        {translate('screens/AboutScreen', link.title)}
      </ThemedTextV2>
      <ThemedIcon
        dark={tailwind('text-mono-dark-v2-700')}
        light={tailwind('text-mono-light-v2-700')}
        iconType='Feather'
        name='external-link'
        size={16}
      />
    </ThemedTouchableOpacityV2>
  )
}
