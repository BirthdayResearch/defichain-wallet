import { MaterialCommunityIcons } from '@expo/vector-icons'
import { nativeApplicationVersion } from 'expo-application'

import { TouchableOpacity, View } from 'react-native'
import { AppIcon } from '@components/icons/AppIcon'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { openURL } from '@api/linking'
import { SettingsParamList } from '../SettingsNavigator'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

interface AboutScreenLinks {
  testID: string
  title: string
  subtitle: string
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']
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
    testID: 'knowledge_base_link',
    title: 'Knowledge base',
    subtitle: 'Common questions and support documents',
    iconName: 'help-circle-outline',
    onPress: (navigation) => navigation.navigate('KnowledgeBaseScreen')
  },
  {
    testID: 'community_link',
    title: 'Participate with active community',
    subtitle: 'Report in Github, discuss in Reddit and Telegram',
    iconName: 'account-multiple-outline',
    onPress: (navigation) => navigation.navigate('CommunityScreen')
  },
  {
    testID: 'explorer_link',
    title: 'DeFi Scan', // "DeFi Scan" does not need to be translated
    subtitle: 'Track transactions, tokens and DEX pairs',
    iconName: 'compass-outline',
    url: 'https://defiscan.live/'
  },
  {
    testID: 'official_website',
    title: 'View official website',
    subtitle: 'Learn more about the blockchain',
    iconName: 'web',
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

  return (
    <ThemedScrollView light={tailwind('bg-white')} style={tailwind('px-4')}>
      <View style={tailwind('flex-1 items-center justify-center p-4 mt-4 mb-8')}>
        <AppIcon
          height={70}
          testID='app_logo'
          width={70}
        />

        <ThemedText style={tailwind('text-2xl font-bold mt-3')}>
          {translate('screens/AboutScreen', 'DeFiChain Wallet')}
        </ThemedText>

        <ThemedText style={tailwind('text-base font-light text-black')}>
          {`v${nativeApplicationVersion ?? '0.0.0'}`}
        </ThemedText>

        {hasBetaFeatures && (
          <TouchableOpacity
            testID='try_beta_features'
            onPress={() => navigation.navigate('FeatureFlagScreen')}
          >
            <ThemedText style={tailwind('mt-1 mb-1 text-xs font-light text-black underline')}>
              {translate('screens/AboutScreen', 'Try Beta features')}
            </ThemedText>
          </TouchableOpacity>
        )}

        <View style={tailwind('flex-row justify-center pt-3')}>
          {
            SOCIAL_LINKS.map((link) => (
              <SocialIcon
                {...link}
                key={link.testID}
              />
            ))
          }
        </View>
      </View>

      {
        MAIN_LINKS.map((link) => (
          <LinkItemRow
            {...link}
            key={link.testID}
          />
        ))
      }

      <View style={tailwind('flex-row justify-center items-center text-center mt-2 mb-6')}>
        {
          ABOUT_LINKS.map((l) => (
            <TouchableOpacity
              testID={l.testID}
              style={tailwind('flex-1 p-2 justify-center items-center text-center')}
              onPress={async () => await openURL(l.url)} key={l.testID}
            >
              <ThemedText
                style={tailwind('text-sm font-medium')}
              >{translate('screens/AboutScreen', l.title)}
              </ThemedText>
            </TouchableOpacity>
          ))
        }
      </View>

      <View style={tailwind('items-center mt-2 mb-6')}>
        <ThemedText
          dark={tailwind('text-gray-600')} light={tailwind('text-gray-400')}
          style={tailwind('text-xs font-normal text-center')}
        >
          {translate('screens/CommunityScreen', 'DeFiChain is a community-driven and open project.')}
        </ThemedText>

        <ThemedText
          dark={tailwind('text-gray-600')} light={tailwind('text-gray-400')}
          style={tailwind('text-xs font-normal text-center')}
        >
          {translate('screens/CommunityScreen', 'The DeFiChain Foundation does not provide direct support.')}
        </ThemedText>
      </View>
    </ThemedScrollView>
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
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-gray-50')}
      onPress={handlePress}
      style={tailwind('flex-row p-4 items-center rounded-lg mb-3')}
      testID={testID}
    >
      <ThemedIcon iconType='MaterialCommunityIcons' name={iconName} size={30} />
      <View style={tailwind('flex-col flex-1 ml-4')}>
        <ThemedText
          dark={tailwind('text-gray-100')}
          style={tailwind('font-semibold flex-wrap')}
        >
          {translate('screens/AboutScreen', title)}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-gray-300')}
          light={tailwind('text-gray-600')}
          style={tailwind('font-light text-sm flex-wrap')}
        >
          {translate('screens/AboutScreen', subtitle)}
        </ThemedText>
      </View>
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
      style={tailwind('justify-center items-center rounded-full w-7 h-7 mx-2')}
      testID={testID}
    >
      <ThemedIcon
        dark={tailwind('text-black')}
        light={tailwind('text-white')} style={tailwind('text-gray-100 pl-px')}
        iconType='MaterialCommunityIcons' name={iconName} size={18}
      />
    </ThemedTouchableOpacity>
  )
}
