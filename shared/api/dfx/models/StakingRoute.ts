import { Asset } from './Asset'
import { Deposit } from './Deposit'
import { SellRoute } from './SellRoute'

export enum StakingType {
  REINVEST = 'Reinvest',
  WALLET = 'Wallet',
  BANK_ACCOUNT = 'BankAccount'
}

export interface StakingRoute {
  id: string
  active: boolean
  deposit: Deposit
  rewardType: StakingType
  rewardSell?: SellRoute
  rewardAsset?: Asset
  paybackType: StakingType
  paybackSell?: SellRoute
  paybackAsset?: Asset
  balance: number
  rewardVolume: number
  isInUse: boolean
  fee: number
}
