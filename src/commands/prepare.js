import outputFiles from 'output-files'

import config from '@/src/config'
import configFiles from '@/src/generated-files'

export default async () => {
  await outputFiles(configFiles)
  await config.prepare()
}
