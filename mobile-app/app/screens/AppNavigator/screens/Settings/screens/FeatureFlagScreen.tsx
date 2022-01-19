import { ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { Switch } from '@components/index'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { FeatureFlag, FEATURE_FLAG_ID } from '@shared-types/website'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { WalletAlert } from '@components/WalletAlert'

export interface BetaFeaturesI extends FeatureFlag {
  value: boolean
}

export function FeatureFlagScreen (): JSX.Element {
  const { featureFlags, enabledFeatures, updateEnabledFeatures } = useFeatureFlagContext()
  const [betaFeatures, setBetaFeatures] = useState<BetaFeaturesI []>([])

  const getBetaFeature = (flags: FEATURE_FLAG_ID[]): BetaFeaturesI[] => {
    return featureFlags.reduce((features: BetaFeaturesI[], item: FeatureFlag) => {
      if (item.stage === 'beta') {
        features.push({
          ...item,
          value: flags.includes(item.id)
        })
      }
      return features
    }, [])
  }

  useEffect(() => {
    setBetaFeatures(getBetaFeature(enabledFeatures))
  }, [])

  const onFeatureChange = async (feature: FeatureFlag, value: boolean): Promise<void> => {
    const flags: FEATURE_FLAG_ID[] = value ? [...enabledFeatures, feature.id] : enabledFeatures.filter(e => e !== feature.id)
    if (value) {
      WalletAlert({
        title: translate('screens/FeatureFlagScreen', 'Enable {{feature}} (Beta)', { feature: translate('screens/Settings', feature.name) }),
        message: translate(
          'screens/FeatureFlagScreen', 'This feature is still in Beta, upon activation you will be expose to some risks. Do you want to continue?'),
        buttons: [
          {
            text: translate('screens/FeatureFlagScreen', 'Cancel'),
            style: 'cancel'
          },
          {
            text: translate('screens/FeatureFlagScreen', 'Continue'),
            style: 'destructive',
            onPress: async () => {
              setBetaFeatures(getBetaFeature(flags))
              await updateEnabledFeatures(flags)
            }
          }
        ]
      })
    } else {
      setBetaFeatures(getBetaFeature(flags))
      await updateEnabledFeatures(flags)
    }
  }

  return (
    <ThemedScrollView testID='features_flag_screen'>
      <View style={tailwind('flex-1 p-4 pt-6')}>
        <ThemedText
          style={tailwind('text-base font-semibold')}
        >
          {translate('screens/FeatureFlagScreen', 'Beta Features')}
        </ThemedText>

        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={tailwind('text-sm font-normal')}
        >
          {translate('screens/FeatureFlagScreen', 'Beta feature(s) of Light Wallet represent features undergoing final testing before its official release. Experimentation of the feature(s) are encouraged, but caution is advised when using your assets.')}
        </ThemedText>
      </View>
      {betaFeatures.map((item: BetaFeaturesI) => (
        <FeatureFlagItem
          key={item.id}
          item={item}
          onChange={onFeatureChange}
        />
      ))}
    </ThemedScrollView>
  )
}

interface FeatureFlagItemProps {
  item: BetaFeaturesI
  onChange: (feature: FeatureFlag, value: boolean) => void
}

export function FeatureFlagItem ({ item, onChange }: FeatureFlagItemProps): JSX.Element {
  return (
    <View testID={`feature_${item.id}_row`}>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      >
        <ThemedText
          dark={tailwind('text-white text-opacity-90')}
          light={tailwind('text-black')}
          style={tailwind('font-medium')}
        >
          {translate('screens/FeatureFlagScreen', item.name)}
        </ThemedText>

        <View style={tailwind('flex-row items-center')}>
          <Switch
            onValueChange={(v: boolean) => {
            onChange(item, v)
          }}
            testID={`feature_${item.id}_switch`}
            value={item.value}
          />
        </View>
      </ThemedView>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('px-4 py-2 mb-2 text-sm font-normal')}
      >
        {translate('screens/FeatureFlagScreen', item.description)}
      </ThemedText>
    </View>
  )
}
