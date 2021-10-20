import { tailwind } from '@tailwind'
import React from 'react'

import { ThemedText, ThemedTouchableOpacity, ThemedView } from './themed'

interface TabsProps {
  tabs: TabOption[]
}

interface TabOption {
  label: string
  isActive: boolean
}

export function Tabs (props: TabsProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white')}
      style={tailwind('flex flex-row pt-3')}
    >
      {props.tabs.length === 2 && props.tabs.map((tab, index) => (
        <ThemedTouchableOpacity
          key={index}
          style={tailwind('flex items-center w-2/4')}
        >
          <ThemedText
            light={tailwind({ 'text-gray-500': !tab.isActive, 'border-primary-500': tab.isActive })}
            dark={tailwind({ 'text-gray-400': !tab.isActive, 'border-darkprimary-500': tab.isActive })}
            style={tailwind('text-base pb-3 border-b-2 border-transparent text-center w-max', { 'font-semibold': tab.isActive })}
          >
            {tab.label}
          </ThemedText>
        </ThemedTouchableOpacity>
      ))}

    </ThemedView>
  )
}
