import { AddressActivity } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, ParamListBase } from '@react-navigation/native'
import BigNumber from 'bignumber.js'

// VM for ViewModel
export interface VMTransaction {
  id: string
  desc: string // of each transaction type, eg: Sent, Add Liquidity
  iconName: string
  color: string
  amount: string
  block: number
  token: string
  txid: string
}

export function activitiesToViewModel (activities: AddressActivity[], navigation: NavigationProp<ParamListBase>): VMTransaction[] {
  const newRows = []
  for (let i = 0; i < activities.length; i++) {
    const act = activities[i]
    newRows.push(activityToViewModel(act, navigation))
  }
  return newRows
}

export function activityToViewModel (activity: AddressActivity, navigation?: NavigationProp<ParamListBase>): VMTransaction {
  let iconName: 'arrow-up' | 'arrow-down'
  let color: '#02B31B'|'gray'
  let desc = ''
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
    iconName = 'arrow-down'
    desc = 'Received'
  } else {
    color = 'gray'
    iconName = 'arrow-up'
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
    token: tokenId,
    txid: activity.txid
  }
}
