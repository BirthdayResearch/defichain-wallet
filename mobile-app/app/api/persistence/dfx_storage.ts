import AsyncStorage from '@react-native-async-storage/async-storage'

const DFXWALLET_ADDRESS_LIST = 'DFXWALLET.address_list'
const DFXWALLET_PIN = 'DFXWALLET.pin'

export interface DFXAddrSignature {
  addr: string
  signature: string
  token?: string
}

// Store wallet pin (possible security risk)
async function setWalletPin (pin: string): Promise<void> {
  await AsyncStorage.setItem(DFXWALLET_PIN, pin)
}

// Get wallet pin
async function getWalletPin (): Promise<string> {
  return await AsyncStorage.getItem(DFXWALLET_PIN) ?? ''
}

// Get the pair list
async function getPairList (): Promise<DFXAddrSignature[]> {
  const listStr: string = await AsyncStorage.getItem(DFXWALLET_ADDRESS_LIST) ?? '[]'
  return JSON.parse(listStr)
}

// Check if pair exists
async function hasPair (addr: string): Promise<boolean> {
  const list: DFXAddrSignature[] = await getPairList()
  if (list.some(e => e.addr === addr)) {
    return true
  }
  return false
}

// Add pair to the list if it does not exist already
async function addPair (pair: DFXAddrSignature): Promise<void> {
  const list: DFXAddrSignature[] = await getPairList()
  if (list.some(e => e.addr === pair.addr)) {
    return await Promise.reject(new Error('Pair already exists.'))
  }
  list.push(pair)
  await AsyncStorage.setItem(DFXWALLET_ADDRESS_LIST, JSON.stringify(list))
}

// Get a single pair from list
async function getPair (addr: string): Promise<DFXAddrSignature> {
  const list: DFXAddrSignature[] = await getPairList()
  const resultList: DFXAddrSignature[] = list.filter(pair => pair.addr === addr)
  if (resultList.length === 0) {
    return await Promise.reject(new Error('Address not found.'))
  }
  return await Promise.resolve(resultList[0])
}

// Add or Update pair in list
async function setPair (pair: DFXAddrSignature): Promise<void> {
  const list: DFXAddrSignature[] = await getPairList()
  const index = list.findIndex(element => element.addr === pair.addr)
  if (index > -1) {
    // update
    list[index] = pair
    return await AsyncStorage.setItem(DFXWALLET_ADDRESS_LIST, JSON.stringify(list))
  }

  // insert
  await addPair(pair)
}

// Remove pair from list
async function remPair (addr: string): Promise<void> {
  const list: DFXAddrSignature[] = await getPairList()
  const resultList: DFXAddrSignature[] = list.filter(pair => pair.addr !== addr)
  await AsyncStorage.setItem(DFXWALLET_ADDRESS_LIST, JSON.stringify(resultList))
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
  return await Promise.resolve(pair.token ?? '')
}

// Reset pair list
async function reset (): Promise<void> {
  await AsyncStorage.setItem(DFXWALLET_ADDRESS_LIST, JSON.stringify([]))
  await AsyncStorage.setItem(DFXWALLET_PIN, '')
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
  reset
}
