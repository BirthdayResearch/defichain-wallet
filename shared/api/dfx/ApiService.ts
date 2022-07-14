import { History } from './models/History'
import { getEnvironment } from '@environment'
import { AuthResponse } from './models/ApiDto'
import { Asset } from './models/Asset'
import { BuyRoute, BuyRouteDto, fromBuyRouteDto, toBuyRouteDto } from './models/BuyRoute'
import { CfpResult } from './models/CfpResult'
import { Country } from './models/Country'
import { Fiat } from './models/Fiat'
import { Language } from './models/Language'
import { fromSellRouteDto, SellData, SellRoute, SellRouteDto, toSellRouteDto } from './models/SellRoute'
import {
  CfpVotes,
  fromUserDetailDto,
  fromUserDto,
  KycResult,
  NewUser,
  toUserDto,
  User,
  UserDetail,
  UserDetailDto,
  UserDto
} from './models/User'
import { AuthService, Credentials, Session } from './AuthService'
import { StakingRoute } from './models/StakingRoute'
import { RoutesDto, fromRoutesDto, Routes } from './models/Route'
import { LimitRequest } from './models/LimitRequest'
import { KycData, toKycDataDto } from './models/KycData'
import { Settings } from './models/Settings'
import { HistoryType } from './models/HistoryType'
import * as Updates from 'expo-updates'

const BaseUrl = getEnvironment(Updates.releaseChannel).dfxApiUrl
const AuthUrl = 'auth'
const UserUrl = 'user'
const KycUrl = 'kyc'
const BuyUrl = 'buy'
const RouteUrl = 'route'
const SellUrl = 'sell'
const StakingUrl = 'staking'
const HistoryUrl = 'history'
const AssetUrl = 'asset'
const FiatUrl = 'fiat'
const CountryUrl = 'country'
const LanguageUrl = 'language'
const BankTxUrl = 'bankTx'
const StatisticUrl = 'statistic'
const SettingUrl = 'setting/frontend'

// --- AUTH --- //
export const signIn = async (credentials?: Credentials): Promise<string> => {
  return await fetchFrom<AuthResponse>(`${AuthUrl}/signIn`, 'POST', credentials).then((resp) => {
    return resp.accessToken
  })
}

export const signUp = async (user: NewUser): Promise<string> => {
  return await fetchFrom<AuthResponse>(`${AuthUrl}/signUp`, 'POST', user).then((resp) => {
    return resp.accessToken
  })
}

// --- USER --- //
export const getUser = async (): Promise<User> => {
  return await fetchFrom<UserDto>(UserUrl).then(fromUserDto)
}

export const getUserDetail = async (): Promise<UserDetail> => {
  return await fetchFrom<UserDetailDto>(`${UserUrl}/detail`).then(fromUserDetailDto)
}

export const putUser = async (user: User): Promise<UserDetail> => {
  return await fetchFrom<UserDetailDto>(UserUrl, 'PUT', toUserDto(user)).then(fromUserDetailDto)
}

export const updateRefFee = async (fee: number): Promise<void> => {
  return await fetchFrom(UserUrl, 'PUT', { refFeePercent: fee })
}

// --- KYC --- //
export const putKycData = async (data: KycData): Promise<void> => {
  return await fetchFrom(`${KycUrl}/data`, 'POST', toKycDataDto(data))
}

export const postKyc = async (): Promise<string> => {
  return await fetchFrom<string>(KycUrl, 'POST')
}

export const getKyc = async (code: string): Promise<KycResult> => {
  return await fetchFrom<KycResult>(`${KycUrl}?code=${code}`)
}

export const postLimit = async (request: LimitRequest): Promise<LimitRequest> => {
  return await fetchFrom<LimitRequest>(`${KycUrl}/limit`, 'POST', request)
}

export const postFounderCertificate = async (files: File[]): Promise<void> => {
  return await postFiles(`${KycUrl}/incorporationCertificate`, files)
}

// --- VOTING --- //
export const getSettings = async (): Promise<Settings> => {
  return await fetchFrom<Settings>(SettingUrl)
}

export const getCfpVotes = async (): Promise<CfpVotes> => {
  return await fetchFrom<CfpVotes>(`${UserUrl}/cfpVotes`)
}

export const putCfpVotes = async (votes: CfpVotes): Promise<CfpVotes> => {
  return await fetchFrom<CfpVotes>(`${UserUrl}/cfpVotes`, 'PUT', votes)
}

// --- PAYMENT ROUTES --- //
export const getRoutes = async (): Promise<Routes> => {
  return await fetchFrom<RoutesDto>(RouteUrl).then(fromRoutesDto)
}

export const getBuyRoutes = async (): Promise<BuyRoute[]> => {
  return await fetchFrom<BuyRouteDto[]>(BuyUrl).then((dtoList) => dtoList.map((dto) => fromBuyRouteDto(dto)))
}

export const postBuyRoute = async (route: BuyRoute): Promise<BuyRoute> => {
  return await fetchFrom<BuyRouteDto>(BuyUrl, 'POST', toBuyRouteDto(route)).then(fromBuyRouteDto)
}

export const putBuyRoute = async (route: BuyRoute): Promise<BuyRoute> => {
  return await fetchFrom<BuyRouteDto>(`${BuyUrl}/${route.id}`, 'PUT', toBuyRouteDto(route)).then(fromBuyRouteDto)
}

export const getSellRoutes = async (): Promise<SellRoute[]> => {
  return await fetchFrom<SellRouteDto[]>(SellUrl).then((dtoList) => dtoList.map((dto) => fromSellRouteDto(dto)))
}

// TODO: check if @deprecated
export const postSellRouteOLD = async (route: SellRoute): Promise<SellRoute> => {
  return await fetchFrom<SellRouteDto>(SellUrl, 'POST', toSellRouteDto(route)).then(fromSellRouteDto)
}

export const postSellRoute = async (route: SellData): Promise<SellRoute> => {
  return await fetchFrom<SellRouteDto>(SellUrl, 'POST', toSellRouteDto(route)).then(fromSellRouteDto)
}

export const putSellRoute = async (route: SellRoute): Promise<SellRoute> => {
  return await fetchFrom<SellRouteDto>(`${SellUrl}/${route.id}`, 'PUT', toSellRouteDto(route)).then(fromSellRouteDto)
}

export const getStakingRoutes = async (): Promise<StakingRoute[]> => {
  return await fetchFrom<StakingRoute[]>(StakingUrl)
}

export const postStakingRoute = async (route: StakingRoute): Promise<StakingRoute> => {
  return await fetchFrom<StakingRoute>(StakingUrl, 'POST', route)
}

export const putStakingRoute = async (route: StakingRoute): Promise<StakingRoute> => {
  return await fetchFrom<StakingRoute>(`${StakingUrl}/${route.id}`, 'PUT', route)
}

export const getHistory = async (types: HistoryType[]): Promise<History[]> => {
  return await fetchFrom<History[]>(`HistoryUrl${toHistoryQuery(types)}`)
}

export const createHistoryCsv = async (types: HistoryType[]): Promise<number> => {
  return await fetchFrom(`${HistoryUrl}/csv${toHistoryQuery(types)}`, 'POST')
}

const toHistoryQuery = (types?: HistoryType[]): string => ((types != null) ? '?' + Object.values(types).join('&') : '')

// --- PAYMENT --- //
export const postSepaFiles = async (files: File[]): Promise<void> => {
  return await postFiles(BankTxUrl, files)
}

// --- STATISTIC --- //
export const getCfpResults = async (voting: string): Promise<CfpResult[]> => {
  return await fetchFrom(`${StatisticUrl}/cfp/${voting}`)
}

// --- MASTER DATA --- //
export const getAssets = async (): Promise<Asset[]> => {
  return await fetchFrom<Asset[]>(AssetUrl)
}

export const getFiats = async (): Promise<Fiat[]> => {
  return await fetchFrom<Fiat[]>(FiatUrl)
}

export const getCountries = async (): Promise<Country[]> => {
  return await fetchFrom<Country[]>(CountryUrl).then((countries) => countries.sort((a, b) => (a.name > b.name ? 1 : -1)))
}

export const getLanguages = async (): Promise<Language[]> => {
  return await fetchFrom<Language[]>(LanguageUrl)
}

// --- HELPERS --- //
const postFiles = async (url: string, files: File[]): Promise<void> => {
  const formData = new FormData()
  files.forEach((value, index) => {
    formData.append('files', value)
  })
  return await fetchFrom(url, 'POST', formData, true)
}

const fetchFrom = async <T>(
  url: string,
  method: 'GET' | 'PUT' | 'POST' = 'GET',
  data?: any,
  noJson?: boolean
): Promise<T> => {
  return (
    await AuthService.Session.then((session) => buildInit(method, session, data, noJson))
      .then(async (init) => await fetch(`${BaseUrl}/${url}`, init))
      .then(async (response) => {
        if (response.ok) {
          return await response.json()
        }
        return await response.json().then((body) => {
          throw body
        })
      })
      .catch((error) => {
        if (error.statusCode === 401) {
          AuthService.deleteSession().catch(() => 'You shall not pass!')
        }

        throw error
      })
  )
}

const buildInit = (method: 'GET' | 'PUT' | 'POST', session: Session, data?: any, noJson?: boolean): RequestInit => ({
  method: method,
  headers: {
    ...((noJson !== undefined && noJson) ? undefined : { 'Content-Type': 'application/json' }),
    Authorization: session.accessToken !== undefined ? 'Bearer ' + session.accessToken : ''
  },
  body: (noJson !== undefined && noJson) ? data : JSON.stringify(data)
})
