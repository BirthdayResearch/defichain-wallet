/* eslint-disable react-native/no-raw-text */
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { PlaygroundStatus, PlaygroundStatusType } from '../components/PlaygroundStatus'
import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { PlaygroundAction } from '../components/PlaygroundAction'

export function PlaygroundStatusInfo (): JSX.Element | null {
  const { wallets } = useWalletPersistenceContext()
  const count = useSelector((state: RootState) => state.block.count)

  const getRhsChildrenStyling =
    {
      dark: tailwind('text-mono-dark-v2-700'),
      light: tailwind('text-mono-light-v2-700'),
      style: tailwind('font-normal-v2 text-sm')
    }

  const dataLists = [
    {
      title: 'Status',
      rhsChildren: (): JSX.Element => {
        return (
          <PlaygroundStatus {...{ online: wallets.length > 0, offline: wallets.length === 0, type: PlaygroundStatusType.primary }} />
        )
      },
      testID: 'wallet_network_status'
    },
    {
      title: 'Current block',
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedTextV2 {...getRhsChildrenStyling}>
            {count === 0 ? '...' : count}
          </ThemedTextV2>
        )
      },
      testID: 'current_block_count'
    },
    {
      title: 'Block generation',
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedTextV2 {...getRhsChildrenStyling}>
            Every 3 seconds
          </ThemedTextV2>
        )
      }
    },
    {
      title: 'Blockchain reset',
      rhsChildren: (): JSX.Element => {
        return (
          <ThemedTextV2 {...getRhsChildrenStyling}>
            Daily
          </ThemedTextV2>
        )
      }
    }
  ]

  return (
    <ThemedViewV2
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
      style={tailwind('rounded-lg-v2 px-5')}
    >
      {
        dataLists.map((dataList, index) => (
          <PlaygroundAction
            key={index}
            rhsChildren={dataList.rhsChildren}
            title={dataList.title}
            isLast={index === dataLists.length - 1}
            testID={dataList.testID}
            disabled
          />
        ))
      }
    </ThemedViewV2>
  )
}
