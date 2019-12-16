import { readFileSync } from 'fs-extra'
import P from 'path'
import minimalWorkspaceConfig from './minimal-workspace.config'

export default {
  ...minimalWorkspaceConfig,
  '.gitpod.yml': readFileSync(P.resolve(__dirname, 'config-files', 'gitpod.yml'), 'utf8'),
  '.renovaterc.json': readFileSync(P.resolve(__dirname, 'config-files', 'renovaterc.json'), 'utf8'),
  '.travis.yml': readFileSync(P.resolve(__dirname, 'config-files', 'travis.yml'), 'utf8'),
}
