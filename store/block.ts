import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlockState {
  count?: number
  hash?: string
}

const initialState: BlockState = {
  count: undefined,
  hash: undefined
}

export const block = createSlice({
  name: 'block',
  initialState,
  reducers: {
    updateBlock: (state, action: PayloadAction<{ count: number, hash: string }>) => {
      state.count = action.payload.count
      state.hash = action.payload.hash
    }
  }
})

// TODO(fuxingloh): autoRefresh - useAutoBlockRefresh()
