import { View } from '@components'
import { tailwind } from '@tailwind'
import React from 'react'
import { ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from './themed'

interface TabsProps {
  tabs: TabOption[]
}

interface TabOption {
  label: string
  isActive: boolean
  disabled: boolean
  handleOnPress: () => void
}

export function Tabs (props: TabsProps): JSX.Element {
  return (
    <>
      {
        props.tabs.length === 2
          ? (
            <ThemedView
              light={tailwind('bg-white')}
              dark={tailwind('bg-gray-800')}
              style={tailwind('flex flex-row pt-3')}
            >
              {props.tabs.map((tab, index) => (
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
                      style={tailwind('')}
                    >
                      <ThemedText
                        light={tailwind({ 'text-gray-200': tab.disabled, 'text-gray-500': !tab.isActive && !tab.disabled, 'text-black': tab.isActive })}
                        dark={tailwind({ 'text-gray-700': tab.disabled, 'text-gray-400': !tab.isActive && !tab.disabled, 'text-white': tab.isActive })}
                        style={tailwind('text-base pb-3 text-center ', { 'font-semibold': tab.isActive })}
                      >
                        {tab.label}
                      </ThemedText>
                    </ThemedView>
                  </ThemedTouchableOpacity>
                </View>
              ))}
            </ThemedView>
          )
          : (
            <View style={tailwind('h-12')}>
              <ThemedScrollView
                contentContainerStyle={tailwind('pt-3 px-4')}
                horizontal
                light={tailwind('bg-white')}
                dark={tailwind('bg-gray-800')}
                style={tailwind('flex flex-row -mr-6 flex-1')}
                showsHorizontalScrollIndicator={false}
              >
                {props.tabs.map((tab, index) => (
                  <ThemedTouchableOpacity
                    key={index}
                    light={tailwind('border-b-2', { 'border-primary-500': tab.isActive })}
                    dark={tailwind('border-b-2', { 'border-darkprimary-500': tab.isActive })}
                    style={tailwind('flex items-center mr-6 border-transparent')}
                    onPress={tab.handleOnPress}
                    disabled={tab.disabled}
                  >
                    <ThemedText
                      light={tailwind({ 'text-gray-200': tab.disabled, 'text-gray-500': !tab.isActive && !tab.disabled, 'text-black': tab.isActive })}
                      dark={tailwind({ 'text-gray-700': tab.disabled, 'text-gray-400': !tab.isActive && !tab.disabled, 'text-white': tab.isActive })}
                      style={tailwind('text-base pb-3 text-center', { 'font-semibold': tab.isActive })}
                    >
                      {tab.label}
                    </ThemedText>
                  </ThemedTouchableOpacity>
                ))}
              </ThemedScrollView>
            </View>
          )
      }
    </>
  )
}
