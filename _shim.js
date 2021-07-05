global.Buffer = require('buffer').Buffer
global.process = require('process')

// _shim.js to correct the behavior of React Native JS for compatibility
// TODO(fuxingloh): we could also refactor jellyfish not to use the default buffer
