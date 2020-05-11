import { mapValues } from '@dword-design/functions'
import commands from './commands'

export default commands |> mapValues('handler')
