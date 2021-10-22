import { View } from '@components'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from './themed'

interface TabsProps {
  tabSections: TabOption[]
}

interface TabOption {
  label: string
  isActive: boolean
  disabled: boolean
  handleOnPress: () => void
}

export function Tabs (props: TabsProps): JSX.Element {
  const FixedTab = (): JSX.Element => {
    return (
      <ThemedView
        light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
        style={tailwind('flex flex-row pt-3')}
      >
        {props.tabSections.map((tab, index) => (
          <View
            key={index}
            style={tailwind('w-2/4 flex items-center')}
          >
            <ThemedTouchableOpacity
              light={tailwind('border-b-2', { 'border-primary-500': tab.isActive })}
              dark={tailwind('border-b-2', { 'border-darkprimary-500': tab.isActive })}
              style={tailwind('flex items-center border-transparent')}
              onPress={tab.handleOnPress}
              disabled={tab.disabled}
            >
              <ThemedView
                light={tailwind('bg-white')}
                dark={tailwind('bg-gray-800')}
              >
                <TabLabel tab={tab} />
              </ThemedView>
            </ThemedTouchableOpacity>
          </View>
        ))}
      </ThemedView>
    )
  }

  const ScrollableTabs = (): JSX.Element => {
    return (
      <View style={tailwind('h-12')}>
        <ThemedScrollView
          contentContainerStyle={tailwind('pt-3 px-4')}
          horizontal
          light={tailwind('bg-white')}
          dark={tailwind('bg-gray-800')}
          style={tailwind('flex flex-row -mr-6 flex-1')}
          showsHorizontalScrollIndicator={false}
        >
          {props.tabSections.map((tab, index) => (
            <ThemedTouchableOpacity
              key={index}
              light={tailwind('border-b-2', { 'border-primary-500': tab.isActive })}
              dark={tailwind('border-b-2', { 'border-darkprimary-500': tab.isActive })}
              style={tailwind('flex items-center mr-6 border-transparent')}
              onPress={tab.handleOnPress}
              disabled={tab.disabled}
            >
              <TabLabel tab={tab} />
            </ThemedTouchableOpacity>
          ))}
        </ThemedScrollView>
      </View>
    )
  }

  if (props.tabSections.length === 2) {
    return (<FixedTab />)
  }

  return (<ScrollableTabs />)
}

function TabLabel (props: {tab: TabOption}): JSX.Element {
  return (
    <ThemedText
      light={tailwind({ 'text-gray-200': props.tab.disabled, 'text-gray-500': !props.tab.isActive && !props.tab.disabled, 'text-black': props.tab.isActive })}
      dark={tailwind({ 'text-gray-700': props.tab.disabled, 'text-gray-400': !props.tab.isActive && !props.tab.disabled, 'text-white': props.tab.isActive })}
      style={tailwind('text-base pb-3 text-center', { 'font-semibold': props.tab.isActive })}
    >
      {translate('components/tabs', props.tab.label)}
    </ThemedText>
  )
}
