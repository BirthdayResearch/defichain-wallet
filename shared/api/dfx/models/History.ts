export interface History {
  type: string
  inputId: string
  inputDate: Date
  inputAmount: number
  inputAsset: string
  inputAddress: string

  outputId: string
  outputDate: Date
  outputAmount: number
  outputAsset: string
  outputAddress: string

  name: string
  fee: number
  notificationMail: string
}
