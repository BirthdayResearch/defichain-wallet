// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@cypress/code-coverage/support'
import './commands'

Cypress.Server.defaults({
  ignore: (xhr: Request) => {
    return xhr.url.match(/^.+\/v0\/(playground)\/.+$/)
  }
})

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of undefined (reading 'undefined')")) {
    return false
  }
})
