import { useDispatch } from 'react-redux'
import { RootStore } from '@store'

export type AppDispatch = RootStore['dispatch']
/* eslint-disable */ 
export const useAppDispatch = () => useDispatch<AppDispatch>()
