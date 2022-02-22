import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

const initialState: any = {
  settings: {}
}

export const fetchUserPreferences = createAsyncThunk(
  'userPreferences/fetchUserPreferences',
  async () => {
    let userPreferences = {}
    if ((Platform.OS === 'android' || Platform.OS === 'ios') && FileSystem.documentDirectory != null) {
      const fileName = 'defichain_wallet_settings.json'
      const directory = `${FileSystem.documentDirectory}${fileName}`
      const fileInfo = await FileSystem.getInfoAsync(directory)
      if (!fileInfo.exists) {
        console.log('Does not exist!!!')
        try {
          await FileSystem.writeAsStringAsync(directory, JSON.stringify({}), { encoding: 'utf8' })
          userPreferences = {}
        } catch (e) {
          console.log(e)
        }
      } else {
        const fileContents = await FileSystem.readAsStringAsync(directory)
        userPreferences = fileContents !== undefined ? JSON.parse(fileContents) : userPreferences
        console.log(userPreferences)
        await FileSystem.writeAsStringAsync(directory, JSON.stringify({ ...userPreferences, dateToday: new Date().getTime() }), { encoding: 'utf8' })
      }
    }
    return userPreferences
  }
)

export const userPreferences = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserPreferences.fulfilled, (state, action: PayloadAction<any>) => {
      state.settings = action.payload
    })
  }
})
