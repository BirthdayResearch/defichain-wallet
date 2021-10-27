import { View } from '@components'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from './themed'

interface TabsProps {
  activeTabId: TabOption['id']
  tabSections: TabOption[]
  testID?: string
}

interface TabOption {
  id: number
  label: string
  disabled: boolean
  handleOnPress: (id: number) => void
}

export function Tabs (props: TabsProps): JSX.Element {
  const FixedTab = (): JSX.Element => {
    return (
      <ThemedView
        light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
        style={tailwind('flex flex-row pt-3')}
        testID={props.testID}
      >
        {props.tabSections.map((tab) => {
          const isActive = tab.id === props.activeTabId
          return (
            <View
              key={tab.id}
              style={tailwind('w-2/4 flex items-center')}
            >
              <ThemedTouchableOpacity
                light={tailwind('border-b-2', { 'border-primary-500': isActive })}
                dark={tailwind('border-b-2', { 'border-darkprimary-500': isActive })}
                style={tailwind('flex items-center border-transparent')}
                onPress={() => tab.handleOnPress(tab.id)}
                disabled={tab.disabled}
              >
                <ThemedView
                  light={tailwind('bg-white')}
                  dark={tailwind('bg-gray-800')}
                >
                  <TabLabel tab={tab} isActive={isActive} />
                </ThemedView>
              </ThemedTouchableOpacity>
            </View>
)
        })}
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
          {props.tabSections.map((tab, index) => {
            const isActive = tab.id === props.activeTabId
            return (
              <ThemedTouchableOpacity
                key={index}
                light={tailwind('border-b-2', { 'border-primary-500': isActive })}
                dark={tailwind('border-b-2', { 'border-darkprimary-500': isActive })}
                style={tailwind('flex items-center mr-6 border-transparent')}
                onPress={() => tab.handleOnPress(tab.id)}
                disabled={tab.disabled}
              >
                <TabLabel tab={tab} isActive={isActive} />
              </ThemedTouchableOpacity>
          )
          })}
        </ThemedScrollView>
      </View>
    )
  }

  if (props.tabSections.length === 2) {
    return (<FixedTab />)
  }

  return (<ScrollableTabs />)
}

function TabLabel (props: {tab: TabOption, isActive: boolean}): JSX.Element {
  return (
    <ThemedText
      light={tailwind({ 'text-gray-200': props.tab.disabled, 'text-gray-500': !props.isActive && !props.tab.disabled, 'text-black': props.isActive })}
      dark={tailwind({ 'text-gray-700': props.tab.disabled, 'text-gray-400': !props.isActive && !props.tab.disabled, 'text-white': props.isActive })}
      style={tailwind('text-base pb-3 text-center', { 'font-semibold': props.isActive })}
    >
      {translate('components/tabs', props.tab.label)}
    </ThemedText>
  )
}
