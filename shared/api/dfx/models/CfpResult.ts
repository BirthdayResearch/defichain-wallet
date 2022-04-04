enum ResultStatus {
  APPROVED = 'Approved',
  NOT_APPROVED = 'Not approved',
}

enum VotingType {
  CFP = 'cfp',
  DFIP = 'dfip',
}

interface Vote {
  address: string
  signature: string
  cfpId: string
  vote: string
  createdAt: string
  isCake: boolean
}

export interface CfpResult {
  number: number
  title: string
  type: VotingType
  dfiAmount: number
  htmlUrl: string
  currentResult: ResultStatus
  totalVotes: {
    total: number
    possible: number
    turnout: number
    yes: number
    neutral: number
    no: number
  }
  cakeVotes: {
    total: number
    yes: number
    neutral: number
    no: number
  }
  voteDetails: {
    yes: Vote[]
    no: Vote[]
    neutral: Vote[]
  }
  startDate: string
  endDate: string
}
