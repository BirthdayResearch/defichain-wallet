import { join } from 'path'

import { rootDir } from './utils/env'

export default {
  main: [
    join(rootDir, '../index.tsx'),
    join(__dirname, './utils/cleanConsoleOnHMR.js'),
  ],
}
