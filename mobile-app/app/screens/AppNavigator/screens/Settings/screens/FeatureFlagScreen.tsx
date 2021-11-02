import { ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { ThemedSectionTitle } from '@components/themed/ThemedSectionTitle'
import { Switch } from '@components/index'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { FeatureFlag, FEATURE_FLAG_ID } from '@shared-types/website'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

export interface BetaFeaturesI extends FeatureFlag {
  value: boolean
}

export function FeatureFlagScreen (): JSX.Element {
  const { featureFlags, enabledFeatures, updateEnabledFeatures } = useFeatureFlagContext()
  const features = featureFlags.filter((item) => item.stage === 'beta')
  const [betaFeatures, setBetaFeatures] = useState<BetaFeaturesI []>([])

  const getBetaFeature = (flags: FEATURE_FLAG_ID[]): BetaFeaturesI[] => {
    return features.map((item: FeatureFlag) => {
      return {
        ...item,
        value: flags.includes(item.id)
      }
    })
  }

  useEffect(() => {
    setBetaFeatures(getBetaFeature(enabledFeatures))
  }, [])

  const onFeatureChange = async (id: FEATURE_FLAG_ID, value: boolean): Promise<void> => {
    const flags: FEATURE_FLAG_ID[] = value ? [...enabledFeatures, id] : enabledFeatures.filter(e => e !== id)
    setBetaFeatures(getBetaFeature(flags))
    await updateEnabledFeatures(flags)
  }

  return (
    <ThemedScrollView light={tailwind('bg-white')}>
      <View testID='features_flag_screen'>
        <ThemedSectionTitle
          testID='features_flag_screen_title'
          text={translate('screens/FeatureFlagScreen', 'APP beta features')}
        />
        {betaFeatures.length === 0
        ? (
          <View style={tailwind('p-4')}>
            <ThemedText
              dark={tailwind('text-gray-600')}
              light={tailwind('text-gray-400')}
              style={tailwind('text-xs font-normal')}
            >
              {translate('screens/FeatureFlagScreen', 'No beta features available.')}
            </ThemedText>
          </View>
          )
        : (
          <>
            {betaFeatures.map((item: BetaFeaturesI) => (
              <FeatureFlagItem
                key={item.id}
                item={item}
                onChange={onFeatureChange}
              />
            ))}

            <View style={tailwind('p-4')}>
              <ThemedText
                dark={tailwind('text-gray-600')}
                light={tailwind('text-gray-400')}
                style={tailwind('text-xs font-normal')}
              >
                {translate('screens/FeatureFlagScreen', 'Enable/disable beta features')}
              </ThemedText>
            </View>
          </>
        )}
      </View>
    </ThemedScrollView>
  )
}

interface FeatureFlagItemProps {
  item: BetaFeaturesI
  onChange: (type: FEATURE_FLAG_ID, value: boolean) => void
}

export function FeatureFlagItem ({ item, onChange }: FeatureFlagItemProps): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      testID={`feature_${item.id}_row`}
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
          onValueChange={(v) => {
            onChange(item.id, v)
          }}
          testID={`feature_${item.id}_switch`}
          value={item.value}
        />
      </View>
    </ThemedView>
  )
}
