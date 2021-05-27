import * as findInFiles from 'find-in-files'
import * as fs from 'fs'
import { findMissingTranslations } from "./index";
import { translations } from '../languages'

jest.mock('find-in-files');
const mockedFindInFiles = findInFiles as jest.Mocked<typeof findInFiles>;
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;
jest.mock('../index')
const mockedTranslations = translations as jest.Mocked<typeof translations>;

const input = {
  'screens\TransactionsScreen\TransactionsScreen.tsx': {
    matches: [
      "translate('screens/TransactionsScreen', 'Transactions Text %1')",
      "translate('screens/TransactionsScreen', 'Transactions')",
      "translate('screens/TransactionsScreen', 'Hello')"
    ],
    count: 3,
    line: null
  },
  'screens\SettingsScreen\SettingsScreen.tsx': {
    matches: [
      "translate('screens/SettingsScreen', 'Settings')",
      "translate('screens/SettingsScreen', 'World')"
    ],
    count: 2,
    line: null
  },
};

describe('translations reporter', () => {

  beforeEach(() => {
    mockedFindInFiles.find.mockResolvedValue(input)
    mockedFs.writeFileSync.mockImplementation(() => {
    })
    mockedTranslations.de = {
      'screens/TransactionsScreen': {
        Transactions: 'Transaktionen'
      },
      'screens/SettingsScreen': {
        Settings: 'Einstellungen'
      }
    } as any
    mockedTranslations["zh-Hans"] = {
      'screens/TransactionsScreen': {
        'Transactions': 'Transaktionen',
        'Transactions Text %1': 'Transaktionen',
        'Hello': 'Hello'
      },
      'screens/SettingsScreen': {
        Settings: 'Settings',
        World: 'World'
      }
    } as any
    mockedTranslations["zh-Hant"] = {} as any
  })

  it('should return missing translations', async () => {
    const result = await findMissingTranslations()
    expect(mockedFindInFiles.find).toHaveBeenCalled()
    expect(mockedFs.writeFileSync).toHaveBeenCalled()
    expect(result['zh-Hans'].missingCount).toStrictEqual(0)
    expect(result['zh-Hant'].missingCount).toStrictEqual(5)
    expect(result['de'].missingCount).toStrictEqual(3)
  })

  it('should handle empty base file', async () => {
    mockedFindInFiles.find.mockResolvedValue({
      'screens\TransactionsScreen\TransactionsScreen.tsx': {
        matches: ["translate(,)"],
        count: 1,
        line: null
      },
    })
    const result = await findMissingTranslations()
    expect(result).toStrictEqual({})
  })
})
