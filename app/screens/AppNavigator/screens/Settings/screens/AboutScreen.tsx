import { MaterialCommunityIcons } from '@expo/vector-icons'
import { nativeApplicationVersion } from 'expo-application'
import React, { useCallback } from 'react'
import { Linking, TouchableOpacity, View } from 'react-native'
import { AppIcon } from '../../../../../components/icons/AppIcon'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '../../../../../components/themed'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'

interface AboutScreenLinks {
  testID: string
  title: string
  url: string
}

interface AboutScreenSocialLinks {
  testID: string
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  url: string
}

const ABOUT_LINKS: AboutScreenLinks[] = [
  { testID: 'white_paper', title: 'White Paper', url: 'https://defichain.com/white-paper/' },
  { testID: 'privacy_policy_button', title: 'Privacy Policy', url: 'https://defichain.com/privacy-policy/' },
  {
    testID: 'licenses_button',
    title: 'Licenses',
    url: 'https://app.fossa.com/projects/git%2Bgithub.com%2FDeFiCh%2Fwallet/refs/branch/main/eefb43ca2933838df8d16ad8c3b2b92db3278843/browse/licenses'
  }
]

const SOCIAL_LINKS: AboutScreenSocialLinks[] = [
  { testID: 'youtube_social', iconName: 'youtube', url: 'https://www.youtube.com/channel/UCL635AjCJe6gNOD7Awlv4ug' },
  { testID: 'twitter_social', iconName: 'twitter', url: 'https://twitter.com/defichain' }
]

export function AboutScreen (): JSX.Element {
  return (
    <ThemedScrollView>
      <View style={tailwind('flex-1 items-center justify-center p-8')}>
        <AppIcon testID='app_logo' width={150} height={100} />
        <ThemedText style={tailwind('text-2xl font-bold')}>
          {translate('screens/AboutScreen', 'Wallet')}
        </ThemedText>

        <ThemedText style={tailwind('text-base font-light text-black')}>
          {`v${nativeApplicationVersion ?? '0.0.0'}`}
        </ThemedText>

        <View style={tailwind('flex-row justify-center pt-5')}>
          {
            SOCIAL_LINKS.map((link) => <SocialIcon
              {...link}
              key={link.testID}
                                       />)
          }
        </View>
      </View>

      <SectionTitle
        testID='links_title'
        text={translate('screens/AboutScreen', 'LINKS')}
      />

      {
        ABOUT_LINKS.map((link) => <LinkItemRow
          {...link}
          key={link.testID}
                                  />)
      }
    </ThemedScrollView>
  )
}

function LinkItemRow ({ title, url, testID }: AboutScreenLinks): JSX.Element {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    }
  }, [url])

  return (
    <ThemedTouchableOpacity
      onPress={handlePress}
      style={tailwind('flex-row p-4 items-center')}
      testID={testID}
    >
      <ThemedText
        dark={tailwind('text-darkprimary-500')}
        light={tailwind('text-primary-500')}
        style={tailwind('font-semibold')}
      >
        {translate('screens/AboutScreen', title)}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}

function SocialIcon ({ iconName, url, testID }: AboutScreenSocialLinks): JSX.Element {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    }
  }, [url])

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={tailwind('bg-darkprimary-500 justify-center items-center rounded-full w-8 h-8 mx-2')}
      testID={testID}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={20}
        style={tailwind('text-gray-100 pl-px')}
      />
    </TouchableOpacity>
  )
}
