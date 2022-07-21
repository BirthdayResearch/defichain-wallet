import { Language } from './Language'

export enum UserRole {
  Unknown = 'Unknown',
  User = 'User',
  Admin = 'Admin',
  EMPLOYEE = 'Employee',
  VIP = 'VIP',
  BETA = 'Beta',
}

export enum UserStatus {
  NA = 'NA',
  ACTIVE = 'Active',
}

export enum KycStatus {
  NA = 'NA',
  CHATBOT = 'Chatbot',
  ONLINE_ID = 'OnlineId',
  VIDEO_ID = 'VideoId',
  CHECK = 'Check',
  MANUAL = 'Manual',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected',
}

export enum KycState {
  NA = 'NA',
  FAILED = 'Failed',
  REMINDED = 'Reminded',
  REVIEW = 'Review',
}

export enum AccountType {
  PERSONAL = 'Personal',
  BUSINESS = 'Business',
  SOLE_PROPRIETORSHIP = 'SoleProprietorship',
}

export enum CfpVote {
  YES = 'Yes',
  NO = 'No',
  NEUTRAL = 'Neutral',
}

export interface KycResult {
  status: KycStatus
  sessionUrl?: string
  setupUrl?: string
}

export interface NewUser {
  address: string
  signature: string
  walletId: number
  usedRef: string | undefined | null
}

export interface Fees {
  buy: number
  refBonus: number
  sell: number
}

export interface CfpVotes {
  [number: number]: CfpVote
}

export interface UserDto {
  accountType: AccountType
  address: string
  mail: string | null
  phone: string
  language: Language
  usedRef: string | null
  status: UserStatus

  kycStatus: KycStatus
  kycState: KycState
  kycHash: string
  depositLimit: number
  kycDataComplete: boolean

  cfpVotes: CfpVotes
}

export interface User {
  accountType: AccountType
  address: string
  mail: string
  mobileNumber: string
  language: Language
  usedRef: string
  status: UserStatus

  kycStatus: KycStatus
  kycState: KycState
  kycHash: string
  depositLimit: number
  kycDataComplete: boolean

  cfpVotes: CfpVotes
}

export interface UserDetailDto extends UserDto {
  ref?: string
  refFeePercent?: number
  refVolume: number
  refCredit: number
  paidRefCredit: number
  refCount: number
  refCountActive: number
  stakingBalance: number
}

export interface UserDetail extends User {
  ref?: string
  refFeePercent?: number
  refVolume: number
  refCredit: number
  paidRefCredit: number
  refCount: number
  refCountActive: number
  stakingBalance: number
}

export const fromUserDto = (user: UserDto): User => ({
  accountType: user.accountType,
  address: user.address,
  mail: user.mail ?? '',
  mobileNumber: user.phone,
  language: user.language,
  usedRef: user.usedRef ?? '',
  status: user.status,

  kycStatus: user.kycStatus,
  kycState: user.kycState,
  kycHash: user.kycHash,
  depositLimit: user.depositLimit,
  kycDataComplete: user.kycDataComplete,

  cfpVotes: user.cfpVotes
})

export const toUserDto = (user: User): UserDto => ({
  accountType: user.accountType,
  address: user.address,

  mail: toStringDto(user.mail),
  phone: user.mobileNumber,
  language: user.language,
  usedRef: toStringDto(user.usedRef),
  status: user.status,

  kycStatus: user.kycStatus,
  kycState: user.kycState,
  kycHash: user.kycHash,
  depositLimit: user.depositLimit,
  kycDataComplete: user.kycDataComplete,

  cfpVotes: user.cfpVotes
})

export const fromUserDetailDto = (dto: UserDetailDto): UserDetail => ({
  ...fromUserDto(dto),
  ref: dto.ref,
  refFeePercent: dto.refFeePercent,
  refVolume: dto.refVolume,
  refCredit: dto.refCredit,
  paidRefCredit: dto.paidRefCredit,
  refCount: dto.refCount,
  refCountActive: dto.refCountActive,
  stakingBalance: dto.stakingBalance
})

const toStringDto = (string: string): string | null => (string === '' ? null : string)

export const kycCompleted = (kycStatus?: KycStatus): boolean =>
  [KycStatus.MANUAL, KycStatus.COMPLETED].includes(kycStatus ?? KycStatus.NA)

export const kycInProgress = (kycStatus?: KycStatus): boolean =>
  [KycStatus.CHATBOT, KycStatus.ONLINE_ID, KycStatus.VIDEO_ID].includes(kycStatus ?? KycStatus.NA)
