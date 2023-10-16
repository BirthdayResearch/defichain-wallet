global.Buffer = require("buffer").Buffer;
global.process = require("process");
global.TextEncoder = require('text-encoding').TextEncoder;
global.TextDecoder = require('text-encoding').TextDecoder;

// eslint-disable-next-line
import 'react-native-get-random-values';
// eslint-disable-next-line
import "@ethersproject/shims";

// _shim.js to correct the behavior of React Native JS for compatibility
// TODO(fuxingloh): we could also refactor jellyfish not to use the default buffer
