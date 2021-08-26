import { AddressActivity } from '@defichain/whale-api-client/dist/api/address'
import { MaterialIcons } from '@expo/vector-icons'
import BigNumber from 'bignumber.js'

// VM for ViewModel
export interface VMTransaction {
  id: string
  desc: string // of each transaction type, eg: Sent, Add Liquidity
  iconName: React.ComponentProps<typeof MaterialIcons>['name']
  color: string
  amount: string
  block: number
  medianTime: number
  token: string
  txid: string
}

export function activitiesToViewModel (activities: AddressActivity[], isLight: boolean): VMTransaction[] {
  const newRows = []
  for (let i = 0; i < activities.length; i++) {
    const act = activities[i]
    newRows.push(activityToViewModel(act, isLight))
  }
  return newRows
}

export function activityToViewModel (activity: AddressActivity, isLight: boolean): VMTransaction {
  let iconName: 'arrow-upward' | 'arrow-downward'
  let color
  let desc
  const isPositive = activity.vin === undefined

  // TODO(@ivan-zynesis): fix when other token transaction can be included
  const TOKEN_NAME: { [key in number]: string } = {
    0: 'DFI',
    1: 'tBTC'
  }

  const tokenId = TOKEN_NAME[activity.tokenId as number]
  let amount = new BigNumber(activity.value)

  if (isPositive) {
    color = '#02B31B' // green
    // TODO(@ivan-zynesis): Simplified, more complicated token transaction should have different icon and desc
    iconName = 'arrow-downward'
    desc = 'Received'
  } else {
    color = isLight ? 'rgba(0,0,0,0.6)' : 'rgba(212, 212, 212, 0.4)'
    iconName = 'arrow-upward'
    desc = 'Sent'
    amount = amount.negated()
  }

  return {
    id: activity.id,
    desc,
    iconName,
    color,
    amount: amount.toFixed(),
    block: activity.block.height,
    medianTime: activity.block.medianTime,
    token: tokenId,
    txid: activity.txid
  }
}
