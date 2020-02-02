import commands from './commands'
import { mapValues } from '@dword-design/functions'

export default commands |> mapValues('handler')