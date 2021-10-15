import React from 'react'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { useGetAnnouncementsQuery } from '@store/website'

export function Announcements (): JSX.Element {
  const {
    data: announcement,
    isSuccess
  } = useGetAnnouncementsQuery({})
  if (isSuccess && announcement?.en !== undefined) {
    return (
      <ThemedView
        style={tailwind('px-4 py-3 flex-row items-center')} light={tailwind('bg-warning-50')}
        dark={tailwind('bg-darkwarning-50')}
      >
        <ThemedIcon style={tailwind('mr-2')} iconType='MaterialIcons' name='campaign' size={22} />
        <ThemedText style={tailwind('text-xs flex-auto')}>
          aowjdpawoijdpawojpdawojdpoawjdpoawjdpawjdpawjdpawjpdwajpdawjpdawojpdawojpdwajpdajwpdowjapdojwap 6:00am (SGT)
        </ThemedText>
      </ThemedView>
    )
  } else {
    return <></>
  }
}
