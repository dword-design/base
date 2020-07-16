import outputFiles from 'output-files'

import config from './config'
import configFiles from './config-files'

export default async () => {
  await outputFiles(configFiles)
  await config.prepare()
}
