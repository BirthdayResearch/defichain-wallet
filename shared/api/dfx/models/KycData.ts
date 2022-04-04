import { Country } from './Country'
import { AccountType } from './User'

export interface KycData {
  accountType: AccountType
  firstName: string
  lastName: string
  street: string
  houseNumber: string
  zip: string
  location: string
  country: Country

  organizationName: string
  organizationStreet: string
  organizationHouseNumber: string
  organizationLocation: string
  organizationZip: string
  organizationCountry: Country
}

export interface KycDataDto {
  accountType: AccountType
  firstname: string
  surname: string
  street: string
  houseNumber: string
  zip: string
  location: string
  country: Country

  organizationName: string
  organizationStreet: string
  organizationHouseNumber: string
  organizationLocation: string
  organizationZip: string
  organizationCountry: Country
}

export const toKycDataDto = (data: KycData): KycDataDto => ({
  accountType: data.accountType,
  firstname: data.firstName,
  surname: data.lastName,
  street: data.street,
  houseNumber: data.houseNumber,
  zip: data.zip,
  location: data.location,
  country: data.country,
  organizationName: data.organizationName,
  organizationStreet: data.organizationStreet,
  organizationHouseNumber: data.organizationHouseNumber,
  organizationLocation: data.organizationLocation,
  organizationZip: data.organizationZip,
  organizationCountry: data.organizationCountry
})
