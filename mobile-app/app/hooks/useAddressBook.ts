import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState, useAppDispatch } from '@store'
import { setAddressBook, setUserPreferences } from '@store/userPreferences'
import { useSelector } from 'react-redux'

export function useAddressBook (): {
  clearAddressBook: () => void
} {
  const { network } = useNetworkContext()
  const userPreferences = useSelector((state: RootState) => state.userPreferences)
  const dispatch = useAppDispatch()
  const clearAddressBook = (): void => {
    const emptyAddressBook = {}
    dispatch(setAddressBook(emptyAddressBook)).then(() => {
      dispatch(setUserPreferences({
        network,
        preferences: {
          ...userPreferences,
          addressBook: emptyAddressBook
        }
      }))
    })
  }

  return {
    clearAddressBook
  }
}
