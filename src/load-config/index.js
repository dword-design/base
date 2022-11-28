import { property } from '@dword-design/functions'
import { cosmiconfig } from 'cosmiconfig'

export default async () => {
  const explorer = cosmiconfig('base', { packageProp: 'baseConfig' })
  let config = explorer.search() |> await |> property('config')
  if (typeof config === 'string') {
    config = { name: config }
  }

  return config
}
