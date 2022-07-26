import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { openURL } from '@api/linking'
import { ThemedActivityIndicator, ThemedIcon, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { TransactionCloseButton } from './TransactionCloseButton'
import { TransactionIDButton } from './TransactionIDButton'
import { TransactionStatusCode } from '@store/ocean'

interface TransactionDetailProps {
  broadcasted: boolean
  txid?: string
  txUrl?: string
  onClose: () => void
  title?: string
  oceanStatusCode?: TransactionStatusCode
}

export function TransactionDetail ({
  broadcasted,
  txid,
  txUrl,
  onClose,
  title,
  oceanStatusCode
}: TransactionDetailProps): JSX.Element {
  title = title ?? translate('screens/OceanInterface', 'Broadcasting...')

  return (
    <ThemedViewV2
      dark={tailwind('bg-mono-dark-v2-00 border-mono-dark-v2-500',
        { 'border-success-500': oceanStatusCode === TransactionStatusCode.transactionSuccess },
        { 'border-darkwarning-500': oceanStatusCode === TransactionStatusCode.transactionPending }
      )}
      light={tailwind('bg-mono-dark-v2-00 border-mono-light-v2-500',
        { 'border-success-500': oceanStatusCode === TransactionStatusCode.transactionSuccess },
        { 'border-warning-500': oceanStatusCode === TransactionStatusCode.transactionPending }
      )}
      style={tailwind('w-full rounded-lg-v2 px-5 flex flex-row py-3 items-center border-0.5')}
    >
      {
        !broadcasted
          ? <ThemedActivityIndicator />
          : (
            <ThemedIcon
              dark={tailwind({
                  'text-darksuccess-500': oceanStatusCode === TransactionStatusCode.transactionSuccess,
                  'text-darkwarning-500': oceanStatusCode === TransactionStatusCode.transactionPending
                }
              )}
              light={tailwind({
                  'text-success-500': oceanStatusCode === TransactionStatusCode.transactionSuccess,
                  'text-warning-500': oceanStatusCode === TransactionStatusCode.transactionPending
                }
              )}
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
