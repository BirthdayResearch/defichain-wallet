import { WhaleApiClient } from '@defichain/whale-api-client'

context('app/masternodes', () => {
  // bech32, p2sh, legacy
  const addresses = ['bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9', '2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB', 'n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo']
  let network: string

  beforeEach(function () {
    cy.createEmptyWallet()
    // cy.sendDFItoWallet().sendTokenToWallet(['DFI']).wait(100)
    cy.getByTestID('bottom_tab_masternodes').click()
    cy.getByTestID('button_create_masternode').click()
    network = localStorage.getItem('Development.NETWORK')
  })

  it('should be able to createmn with owner address', function () {
    cy.getByTestID('owner_address_radio').should('exist')
    cy.getByTestID('owner_address_radio_checked').should('exist')
    cy.getByTestID('operator_address_radio_checked').should('not.exist')
  })

  it('should be able to createmn with owner address', function () {
    cy.getByTestID('operator_address_radio').should('exist')
    cy.getByTestID('operator_address_radio').click()
    cy.getByTestID('operator_address_radio_checked').should('exist')

    // Start validate
    // Invalid address
    cy.getByTestID('address_input').clear().type('a')
    cy.getByTestID('create_masternode_button').should('have.attr', 'disabled')

    // P2SH is not allowed
    cy.getByTestID('address_input').clear().type(addresses[1])
    cy.getByTestID('create_masternode_button').should('have.attr', 'disabled')

    // Legacy is allowed
    cy.getByTestID('address_input').clear().type(addresses[2])
    cy.getByTestID('create_masternode_button').should('not.have.attr', 'disabled')

    // Bech32 is allowed
    cy.getByTestID('address_input').clear().type(addresses[0])
    cy.getByTestID('create_masternode_button').should('not.have.attr', 'disabled')

    // should display qr
    cy.getByTestID('qr_code_button').should('exist')

    // should display genAddr()

    // action
    cy.getByTestID('create_masternode_button').click()

    // claim the txid
    // const txid =

    // check created mn via client
    const whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest'
    })
    cy.wrap(whale.masternodes.get('')).then((response) => {
      console.log('response: ', response)
    })
  })
})
