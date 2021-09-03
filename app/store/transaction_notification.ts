import { WhaleApiClient } from '@defichain/whale-api-client'
import { Transaction } from '@defichain/whale-api-client/dist/api/transactions'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { Logging } from '@api'

type SubscriberCallback = (result: Transaction) => Promise<void>

export interface TxidSub {
  count: number
  subscribers: {
    [key: string]: SubscriberCallback[]
  }
}

const initialState: TxidSub = {
  count: 0,
  subscribers: {}
}

interface PublishMiddlewareResult {
  count: number
  data: Array<{ txid: string, tx: Transaction }>
}
interface PublishMiddlewareInput {
  count: number
  client: WhaleApiClient
}

export const publish = createAsyncThunk<PublishMiddlewareResult, PublishMiddlewareInput, { state: RootState }>(
  'txidPubSub/updateBlock',
  async ({ count, client }, thunkAPI): Promise<PublishMiddlewareResult> => {
    thunkAPI.dispatch(txidNotification.actions.setBlock(count))
    const { subscribers } = thunkAPI.getState().txidNotification
    const txids = Object.keys(subscribers)
    const data = await Promise.all(txids.map(async txid => {
      const result: { txid: string, tx?: Transaction } = { txid }
      try {
        result.tx = await client.transactions.get(txid)
      } catch (e) { /* still waiting for confirmation */ }

      return result
    }))

    const filtered = (data.filter(val => val.tx !== undefined)) as Array<{ txid: string, tx: Transaction }>
    const result = { count, data: filtered }
    return result
  }
)

export const txidNotification = createSlice({
  name: 'txidPubSub',
  initialState,
  reducers: {
    setBlock: (state, action: PayloadAction<number>) => {
      state.count = action.payload
    },
    subscribe: (state, action: PayloadAction<{ txid: string, cb: SubscriberCallback }>) => {
      const { txid, cb } = action.payload
      if (state.subscribers[txid] === undefined) {
        state.subscribers = {
          [txid]: [cb]
        }
      } else {
        state.subscribers[txid].push(cb)
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(publish.fulfilled, (state, action) => {
      state.count = action.payload.count
      action.payload.data.forEach(({ txid, tx }) => {
        state.subscribers[txid].forEach(sub => {
          sub(tx).catch(e => Logging.error(e))
        })
        state.subscribers[txid] = []
      })
    })
  }
})
