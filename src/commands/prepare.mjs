import outputFiles from 'output-files'

import config from '@/src/config.mjs'
import configFiles from '@/src/generated-files/index.mjs'

export default async () => {
  await outputFiles(configFiles)
  await config.prepare()
}
