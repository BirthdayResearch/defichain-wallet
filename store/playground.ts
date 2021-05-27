import { PlaygroundApiClient, PlaygroundRpcClient } from "@defichain/playground-api-client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export enum PlaygroundStatus {
  NotConnected,
  Connecting,
  Connected,
  Failed
}

export interface PlaygroundState {
  status: PlaygroundStatus
  provider?: string
  api?: PlaygroundApiClient
  rpc?: PlaygroundRpcClient
}

const initialState: PlaygroundState = {
  status: PlaygroundStatus.NotConnected
}

export const initializePlayground = createAsyncThunk(
  'playground/getClient',
  async () => {
    const provider = await getPlaygroundProvider()
    if (provider === undefined) {
      return undefined
    }

    return provider
  }
)

export const playgroundSlice = createSlice({
  name: 'playground',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializePlayground.pending, (state) => {
        state.status = PlaygroundStatus.Connecting
        state.provider = undefined
        state.api = undefined
        state.rpc = undefined
      })
      .addCase(initializePlayground.fulfilled, (state, action) => {
        state.provider = action.payload?.provider
        state.api = action.payload?.api
        state.rpc = action.payload?.rpc
        if (action.payload !== undefined) {
          console.log(action.payload)
          state.status = PlaygroundStatus.Connected
        } else {
          state.status = PlaygroundStatus.Failed
        }
      })
  }
})

async function getPlaygroundProvider (): Promise<{
  api: PlaygroundApiClient | undefined,
  rpc: PlaygroundRpcClient | undefined,
  provider: string
} | undefined> {
  // TODO(fuxingloh): need to refactor for automatic connection, changes need to be made on playground side

  // Local Instance
  const api = new PlaygroundApiClient({ url: 'http://localhost:19553' })
  try {
    await api.rpc.call('getblockchaininfo', [], 'number')
    return {
      api: api,
      rpc: new PlaygroundRpcClient(api),
      provider: 'localhost'
    }
  } catch (ignored) {
    console.log(ignored)
  }

  return undefined
}

