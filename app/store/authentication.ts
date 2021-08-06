import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Authentication<T> {
  consume: (passphrase: string) => Promise<T>
  onAuthenticated: (result: T) => Promise<void>
  message?: string
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
