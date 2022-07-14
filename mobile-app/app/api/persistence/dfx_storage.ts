import AsyncStorage from '@react-native-async-storage/async-storage'

const DFXWALLET_ADDRESS_LIST = 'DFXWALLET.address_list'
const DFXWALLET_PIN = 'DFXWALLET.pin'
const USERINFOCOMPLETE = 'DFXWALLET.userInfoComplete'

export interface DFXAddrSignature {
  network: string
  addr: string
  signature?: string
  token?: string
}

// Store wallet pin
async function setWalletPin (pin: string): Promise<void> {
  await AsyncStorage.setItem(DFXWALLET_PIN, pin)
}

// Get wallet pin
async function getWalletPin (): Promise<string> {
  return await AsyncStorage.getItem(DFXWALLET_PIN) ?? ''
}

// Get/set the pair list
async function getPairList (): Promise<DFXAddrSignature[]> {
  const listStr: string = await AsyncStorage.getItem(DFXWALLET_ADDRESS_LIST) ?? '[]'
  return JSON.parse(listStr)
}

async function setPairList (list: DFXAddrSignature[]): Promise<void> {
  return await AsyncStorage.setItem(DFXWALLET_ADDRESS_LIST, JSON.stringify(list))
}

// Check if pair exists
async function hasPair (addr: string): Promise<boolean> {
  const list: DFXAddrSignature[] = await getPairList()
  return list.some(e => e.addr === addr)
}

// Add pair to the list if it does not exist already
async function addPair (pair: DFXAddrSignature): Promise<void> {
  const list: DFXAddrSignature[] = await getPairList()
  if (list.some(e => e.addr === pair.addr)) {
    throw new Error('Pair already exists.')
  }
  list.push(pair)
  await setPairList(list)
}

// Get a single pair from list
async function getPair (addr: string): Promise<DFXAddrSignature> {
  const list: DFXAddrSignature[] = await getPairList()
  const result = list.find(pair => pair.addr === addr)
  if (result === undefined) {
    throw new Error('Address not found.')
  }
  return result
}

// Add or Update pair in list
async function setPair (pair: DFXAddrSignature): Promise<void> {
  const list: DFXAddrSignature[] = await getPairList()
  const index = list.findIndex(element => element.addr === pair.addr)
  if (index > -1) {
    // update
    list[index] = pair
    return await setPairList(list)
  }

  // insert
  await addPair(pair)
}

// Remove pair from list
async function remPair (addr: string): Promise<void> {
  const list: DFXAddrSignature[] = await getPairList()
  const resultList: DFXAddrSignature[] = list.filter(pair => pair.addr !== addr)
  await setPairList(resultList)
}

// Set token of address pair
async function setToken (addr: string, token: string): Promise<void> {
  const pair = await getPair(addr)
  pair.token = token
  return await setPair(pair)
}

// Get token for address pair
async function getToken (addr: string): Promise<string> {
  const pair = await getPair(addr)
  return pair.token ?? ''
}

// Reset pair list
async function reset (network: string): Promise<void> {
  const list = await getPairList()
  await setPairList(list.filter((i) => i.network != null && i.network !== network))
  await AsyncStorage.setItem(DFXWALLET_PIN, '')
}

async function resetPin (): Promise<void> {
  await AsyncStorage.setItem(DFXWALLET_PIN, '')
}

async function resetToken (address: string): Promise<void> {
  const pair = await getPair(address)
  pair.token = undefined
  return await setPair(pair)
}

// Store UserInfoCompleted (default = true)
async function setUserInfoComplete (address: string, complete: boolean = true): Promise<void> {
  await AsyncStorage.setItem(USERINFOCOMPLETE + address, JSON.stringify(complete))
}

async function getUserInfoComplete (address: string): Promise<boolean | null> {
  const status = await AsyncStorage.getItem(USERINFOCOMPLETE + address)
  return (status === null) ? null : JSON.parse(status)
}

export const DFXPersistence = {
  addPair,
  remPair,
  getPair,
  setPair,
  hasPair,
  setToken,
  getToken,
  setWalletPin,
  getWalletPin,
  getPairList,
  reset,
  resetPin,
  resetToken,
  setUserInfoComplete,
  getUserInfoComplete
}
