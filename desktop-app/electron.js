const net = require('net')
const childProcess = require('child_process')

const port = process.env.PORT ? process.env.PORT - 100 : 19006
process.env.ELECTRON_START_URL = `http://localhost:${port}`

const client = new net.Socket()
let startedElectron = false

function tryConnection () {
  client.connect({ port }, () => {
    client.end()
    if (!startedElectron) {
      console.log('starting electron')
      startedElectron = true
      const exec = childProcess.exec
      exec('npm run electron')
    }
  })
}

tryConnection()

client.on('error', () => {
  setTimeout(tryConnection, 1000)
})
