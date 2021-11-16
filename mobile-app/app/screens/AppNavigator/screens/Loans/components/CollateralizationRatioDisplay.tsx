import * as Progress from 'react-native-progress'
import BigNumber from 'bignumber.js'
import React from 'react'
import { getColor, tailwind } from '@tailwind'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { View } from '@components'
import { ThemedText, ThemedView } from '@components/themed'
import Svg, { Line } from 'react-native-svg'
import { translate } from '@translations'
import { UseCollateralizationRatioColor } from '@hooks/wallet/CollateralizationRatioColor'
import NumberFormat from 'react-number-format'

interface CollateralizationRatioDisplayProps {
  collateralizationRatio: string
  nextCollateralizationRatio: string
  minCollateralizationRatio: string
}

export function CollateralizationRatioDisplay (props: CollateralizationRatioDisplayProps): JSX.Element {
  const maxRatio = 1000
  const minColRatio = new BigNumber(props.minCollateralizationRatio)
  const normalizedColRatio = new BigNumber(props.collateralizationRatio).dividedBy(maxRatio)
  const normalizedNextRatio = new BigNumber(props.nextCollateralizationRatio).dividedBy(maxRatio).multipliedBy(100)
  const normalizedLiquidatedThreshold = minColRatio.multipliedBy(1.25).dividedBy(maxRatio).multipliedBy(100)
  const normalizedAtRiskThreshold = minColRatio.multipliedBy(1.5).dividedBy(maxRatio).multipliedBy(100)

  return (
    <View style={tailwind('mb-4')}>
      <CollateralizationRatioText colRatio={props.collateralizationRatio} minColRatio={props.minCollateralizationRatio} />
      <MinAndNextRatioText minColRatio={props.minCollateralizationRatio} nextColRatio={props.nextCollateralizationRatio} />
      <HealthBar normalizedColRatio={normalizedColRatio} normalizedNextRatio={normalizedNextRatio} />
      <ColorScale normalizedLiquidatedThreshold={normalizedLiquidatedThreshold} normalizedAtRiskThreshold={normalizedAtRiskThreshold} />
    </View>
  )
}

function CollateralizationRatioText (props: {colRatio: string, minColRatio: string}): JSX.Element {
  const { light, dark } = UseCollateralizationRatioColor({
    value: props.colRatio,
    minColRatio: props.minColRatio
  })

  return (
    <View style={tailwind('flex-row justify-between')}>
      <ThemedText
        style={tailwind('text-sm')}
      >
        {translate('components/CollateralizationRatioDisplay', 'Collateralization ratio')}
      </ThemedText>
      {props.colRatio === '-1'
        ? (
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-500')}
            style={tailwind('text-sm font-semibold')}
          >
            {translate('components/CollateralizationRatioDisplay', 'N/A')}
          </ThemedText>
        )
        : (
          <NumberFormat
            value={props.colRatio}
            decimalScale={2}
            thousandSeparator
            displayType='text'
            suffix='%'
            renderText={value =>
              <ThemedText
                light={light}
                dark={dark}
                style={tailwind('text-sm font-semibold')}
              >
                {value}
              </ThemedText>}
          />
        )}
    </View>
  )
}

function MinAndNextRatioText (props: {minColRatio: string, nextColRatio: string}): JSX.Element {
  return (
    <View style={tailwind('flex flex-row items-center justify-between mb-3')}>
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-500')}
          style={tailwind('text-xs mr-0.5')}
        >
          {translate('components/CollateralizationRatioDisplay', 'Min:')}
        </ThemedText>
        <NumberFormat
          value={props.minColRatio}
          decimalScale={2}
          thousandSeparator
          displayType='text'
          suffix='%'
          renderText={value =>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-500')}
              style={tailwind('text-xs')}
            >
              {value}
            </ThemedText>}
        />
      </View>
      {props.nextColRatio === '-1'
        ? (
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-500')}
            style={tailwind('text-xs')}
          >
            {translate('components/CollateralizationRatioDisplay', 'n/a')}
          </ThemedText>
        )
       : (
         <View style={tailwind('flex flex-row items-center')}>
           <ThemedText
             light={tailwind('text-gray-500')}
             dark={tailwind('text-gray-500')}
             style={tailwind('text-xs mr-0.5')}
           >
             {translate('components/CollateralizationRatioDisplay', 'Next:')}
           </ThemedText>
           <NumberFormat
             value={props.nextColRatio}
             decimalScale={2}
             thousandSeparator
             displayType='text'
             prefix='~'
             suffix='%'
             renderText={value =>
               <ThemedText
                 light={tailwind('text-gray-500')}
                 dark={tailwind('text-gray-500')}
                 style={tailwind('text-xs')}
               >
                 {value}
               </ThemedText>}
           />
         </View>
       )}

    </View>
  )
}

function HealthBar (props: {normalizedColRatio: BigNumber, normalizedNextRatio: BigNumber}): JSX.Element {
  const { isLight } = useThemeContext()

  return (
    <View style={tailwind('relative')}>
      <Progress.Bar
        progress={props.normalizedColRatio.toNumber()}
        width={null}
        borderColor={getColor(isLight ? 'gray-300' : 'gray-600')}
        color={getColor(isLight ? 'white' : 'black')}
        unfilledColor={getColor(isLight ? 'gray-100' : 'gray-900')}
        borderRadius={8}
        height={12}
      />
      <ThemedView
        light={tailwind('bg-black')}
        dark={tailwind('bg-white')}
        style={[tailwind('w-px h-4 absolute bottom-0'), { left: `${BigNumber.min(props.normalizedColRatio.multipliedBy(100), 100).toFixed(2)}%` }]}
      />
      <View style={[tailwind('absolute bottom-0'), { left: `${BigNumber.min(props.normalizedNextRatio, 100).toFixed(2)}%` }]}>
        <Svg height='16' width='1' viewBox='0 0 1 16'>
          <Line strokeDasharray='3, 2' x1='0' y1='0' x2='0' y2='100' stroke={`${isLight ? 'black' : 'white'}`} strokeWidth='10' />
        </Svg>
      </View>
    </View>
  )
}

function ColorScale (props: {normalizedLiquidatedThreshold: BigNumber, normalizedAtRiskThreshold: BigNumber}): JSX.Element {
  return (
    <View style={tailwind('flex flex-row mt-1')}>
      <ThemedView
        light={tailwind('bg-error-200')}
        dark={tailwind('bg-darkerror-200')}
        style={[tailwind('h-1 mr-0.5'), { width: `${props.normalizedLiquidatedThreshold.toFixed(2)}%` }]}
      />
      <ThemedView
        light={tailwind('bg-warning-300')}
        dark={tailwind('bg-darkwarning-300')}
        style={[tailwind('h-1 mr-0.5'), { width: `${props.normalizedAtRiskThreshold.toFixed(2)}%` }]}
      />
      <ThemedView
        light={tailwind('bg-success-300')}
        dark={tailwind('bg-darksuccess-300')}
        style={tailwind('h-1 flex-1')}
      />
    </View>
  )
}
