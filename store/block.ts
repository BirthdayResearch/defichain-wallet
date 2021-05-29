import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlockState {
  count?: number
}

const initialState: BlockState = {
  count: undefined
}

export const block = createSlice({
  name: 'block',
  initialState,
  reducers: {
    updateBlock: (state, action: PayloadAction<{ count: number }>) => {
      state.count = action.payload.count
    }
  }
})
