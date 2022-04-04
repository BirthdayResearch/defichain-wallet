import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Authentication<T> {
  consume: (passphrase: string) => Promise<T> // also serve as passphrase validation logic
  onAuthenticated: (result: T) => Promise<void>
  // OPTIONAL error handler
  // (CRITICAL invalid passphare error is auto handled, include wipe wallet if necessary)
  onError?: (e: Error) => void

  // messages in passcode UI
  // message and loading are mandatory, default message is for signing transaction
  title?: string
  message: string
  loading: string
}

const initialState: { authentication?: Authentication<any> } = {}

export const authentication = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    prompt: (state, action: PayloadAction<Authentication<any>>) => {
      state.authentication = action.payload
    },
    dismiss: (state) => {
      delete state.authentication
    }
  }
})
