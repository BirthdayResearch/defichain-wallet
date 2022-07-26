import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { openURL } from '@api/linking'
import { ThemedActivityIndicator, ThemedIcon, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { TransactionCloseButton } from './TransactionCloseButton'
import { TransactionIDButton } from './TransactionIDButton'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

interface TransactionDetailProps {
  broadcasted: boolean
  txid?: string
  txUrl?: string
  onClose: () => void
  title?: string
  statusCode?: number
}

export function TransactionDetail ({
  broadcasted,
  txid,
  txUrl,
  onClose,
  title,
  statusCode
}: TransactionDetailProps): JSX.Element {
  title = title ?? translate('screens/OceanInterface', 'Broadcasting...')

  const { isLight } = useThemeContext()

  const themedOrange = isLight ? 'border-warning-500' : 'border-darkwarning-500'
  const status = statusCode === 200 ? 'border-success-500' : themedOrange
  const borderColour = broadcasted ? status : 'border-mono-dark-v2-500'

  return (
    <ThemedViewV2
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
      style={tailwind(`w-full rounded-lg-v2 px-5 flex flex-row py-3 items-center border-0.5 ${borderColour}`)}
    >
      {
        !broadcasted
          ? <ThemedActivityIndicator />
          : (
            <ThemedIcon
              dark={tailwind(statusCode === 200 ? 'text-darksuccess-500' : 'text-darkwarning-500')}
              light={tailwind(statusCode === 200 ? 'text-success-500' : 'text-warning-500')}
              iconType='MaterialIcons'
              name='check-circle'
              size={20}
            />
          )
      }

      <View style={tailwind('flex-auto px-4 justify-center w-8/12')}>
        <ThemedTextV2
          light={tailwind('text-mono-light-v2-900')}
          dark={tailwind('text-mono-dark-v2-900')}
          style={tailwind('text-sm font-normal-v2')}
        >
          {title}
        </ThemedTextV2>

        {
          txid !== undefined && txUrl !== undefined &&
            <TransactionIDButton
              onPress={async () => await gotoExplorer(txUrl)}
              txid={txid}
            />
        }
      </View>

      {
        broadcasted && <TransactionCloseButton onPress={onClose} />
      }
    </ThemedViewV2>
  )
}

async function gotoExplorer (txUrl: string): Promise<void> {
  // TODO(thedoublejay) explorer URL
  // TODO (future improvement): this page should support in mempool, to be confirm
  await openURL(txUrl)
}
