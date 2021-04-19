import { mapValues } from '@dword-design/functions'

import commands from './commands/index.mjs'

export default commands |> mapValues('handler')
