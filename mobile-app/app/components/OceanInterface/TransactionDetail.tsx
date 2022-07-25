import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { openURL } from '@api/linking'
import { ThemedActivityIndicator, ThemedIcon, ThemedText, ThemedViewV2 } from '@components/themed'
import { TransactionCloseButton } from './TransactionCloseButton'
import { TransactionIDButton } from './TransactionIDButton'

interface TransactionDetailProps {
  broadcasted: boolean
  txid?: string
  txUrl?: string
  onClose: () => void
  title?: string
}

export function TransactionDetail ({
  broadcasted,
  txid,
  txUrl,
  onClose,
  title
}: TransactionDetailProps): JSX.Element {
  title = title ?? translate('screens/OceanInterface', 'Broadcasting...')

  const borderColour = broadcasted ? 'border-success-500' : 'border-mono-dark-v2-500'
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
              dark={tailwind('text-darksuccess-500')}
              iconType='MaterialIcons'
              light={tailwind('text-success-500')}
              name='check-circle'
              size={20}
            />
          )
      }

      <View style={tailwind('flex-auto px-4 justify-center')}>
        <ThemedText
          style={tailwind('text-sm font-bold')}
        >
          {title}
        </ThemedText>

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
