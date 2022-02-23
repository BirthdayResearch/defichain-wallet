import * as Progress from 'react-native-progress'
import BigNumber from 'bignumber.js'

import { getColor, tailwind } from '@tailwind'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { View } from '@components'
import { ThemedText, ThemedView } from '@components/themed'
import Svg, { Line } from 'react-native-svg'
import { translate } from '@translations'
import { useCollateralizationRatioColor } from '@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio'
import NumberFormat from 'react-number-format'
import { BottomSheetInfo } from '@components/BottomSheetInfo'

interface CollateralizationRatioDisplayProps {
  collateralizationRatio: string
  nextCollateralizationRatio: string
  minCollateralizationRatio: string
  totalLoanAmount: string
  testID: string
}

export function CollateralizationRatioDisplay (props: CollateralizationRatioDisplayProps): JSX.Element {
  const atRiskThresholdMultiplier = 1.5
  const minColRatio = new BigNumber(props.minCollateralizationRatio)
  const maxRatio = getMaxRatio(minColRatio.multipliedBy(atRiskThresholdMultiplier))
  const normalizedColRatio = new BigNumber(props.collateralizationRatio).dividedBy(maxRatio)
  const normalizedNextRatio = new BigNumber(props.nextCollateralizationRatio).dividedBy(maxRatio).multipliedBy(100)
  const normalizedLiquidatedThreshold = minColRatio.multipliedBy(1.25).dividedBy(maxRatio).multipliedBy(100)
  const normalizedAtRiskThreshold = minColRatio.multipliedBy(atRiskThresholdMultiplier).dividedBy(maxRatio).multipliedBy(100)

  return (
    <View testID={`${props.testID}_collateralization_bar`} style={tailwind('mb-4')}>
      <CollateralizationRatioText
        testID={props.testID}
        totalLoanAmount={props.totalLoanAmount}
        colRatio={props.collateralizationRatio}
        minColRatio={props.minCollateralizationRatio}
      />
      <MinAndNextRatioText
        testID={props.testID}
        minColRatio={props.minCollateralizationRatio}
        nextColRatio={props.nextCollateralizationRatio}
      />
      <HealthBar normalizedColRatio={normalizedColRatio} normalizedNextRatio={normalizedNextRatio} />
      <ColorScale
        normalizedLiquidatedThreshold={normalizedLiquidatedThreshold}
        normalizedAtRiskThreshold={normalizedAtRiskThreshold}
      />
    </View>
  )
}

function CollateralizationRatioText (props: { colRatio: string, minColRatio: string, totalLoanAmount: string, testID?: string }): JSX.Element {
  const {
    light,
    dark
  } = useCollateralizationRatioColor({
    colRatio: new BigNumber(props.colRatio),
    minColRatio: new BigNumber(props.minColRatio),
    totalLoanAmount: new BigNumber(props.totalLoanAmount)
  })
  const alertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  }
  return (
    <View style={tailwind('flex-row justify-between')}>
      <View style={tailwind('items-center flex-row')}>
        <ThemedText
          style={tailwind('text-sm mr-0.5')}
        >
          {translate('components/CollateralizationRatioDisplay', 'Collateralization ratio')}
        </ThemedText>
        <BottomSheetInfo alertInfo={alertInfo} name={alertInfo.title} />
      </View>
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
                testID={`${props.testID ?? ''}_col_ratio`}
                style={tailwind('text-sm font-semibold')}
              >
                {value}
              </ThemedText>}
          />
        )}
    </View>
  )
}

function MinAndNextRatioText (props: { minColRatio: string, nextColRatio: string, testID: string }): JSX.Element {
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
              testID={`${props.testID}_min_ratio`}
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
                  testID={`${props.testID}_next_ratio`}
                >
                  {value}
                </ThemedText>}
            />
          </View>
        )}

    </View>
  )
}

function HealthBar (props: { normalizedColRatio: BigNumber, normalizedNextRatio: BigNumber }): JSX.Element {
  const { isLight } = useThemeContext()

  return (
    <View style={tailwind('relative')}>
      <Progress.Bar
        progress={props.normalizedColRatio.toNumber()}
        width={null}
        borderColor={getColor(isLight ? 'gray-300' : 'gray-800')}
        color={getColor(isLight ? 'white' : 'gray-200')}
        unfilledColor={getColor(isLight ? 'gray-100' : 'gray-700')}
        borderRadius={8}
        height={12}
      />
      {props.normalizedColRatio.isGreaterThanOrEqualTo(0) &&
      (
        <>
          <ThemedView
            light={tailwind('bg-black')}
            dark={tailwind('bg-white')}
            style={[tailwind('w-px h-4 absolute bottom-0'), {
              left: `${BigNumber.min(props.normalizedColRatio.multipliedBy(100), 99.7).toFixed(2)}%`
            }]}
          />
          <View style={[tailwind('absolute bottom-0'), {
            left: `${BigNumber.min(props.normalizedNextRatio, 99.7).toFixed(2)}%`
          }]}
          >
            <Svg height='16' width='1' viewBox='0 0 1 16'>
              <Line
                strokeDasharray='3, 2' x1='0' y1='0' x2='0' y2='100' stroke={`${isLight ? 'black' : 'white'}`}
                strokeWidth='10'
              />
            </Svg>
          </View>
        </>
      )}
    </View>
  )
}

function ColorScale (props: { normalizedLiquidatedThreshold: BigNumber, normalizedAtRiskThreshold: BigNumber }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row mt-1')}>
      <ThemedView
        light={tailwind('bg-error-200')}
        dark={tailwind('bg-darkerror-200')}
        style={[tailwind('h-1'), { width: `${props.normalizedLiquidatedThreshold.toFixed(2)}%` }]}
      />
      <ThemedView
        light={tailwind('bg-warning-300')}
        dark={tailwind('bg-darkwarning-300')}
        style={[tailwind('h-1'), { width: `${props.normalizedAtRiskThreshold.minus(props.normalizedLiquidatedThreshold).toFixed(2)}%` }]}
      />
      <ThemedView
        light={tailwind('bg-success-300')}
        dark={tailwind('bg-darksuccess-300')}
        style={tailwind('h-1 flex-1')}
      />
    </View>
  )
}

function getMaxRatio (atRiskThreshold: BigNumber): number {
  const healthyScaleRatio = 0.75
  return atRiskThreshold.dividedBy(new BigNumber(1).minus(healthyScaleRatio)).toNumber()
}
