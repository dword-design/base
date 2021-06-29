import { endent, identity, mergeAll } from '@dword-design/functions'
import depcheck from 'depcheck'
import depcheckDetectorExeca from 'depcheck-detector-execa'
import depcheckDetectorPackageName from 'depcheck-detector-package-name'
import depcheckParserBabel from 'depcheck-parser-babel'
import importCwd from 'import-cwd'

import depcheckSpecialBaseConfig from './depcheck-special-base-config'
import packageConfig from './package-config'
import rawConfig from './raw-config'

const inheritedConfig = importCwd(rawConfig.name)

export default mergeAll([
  {
    allowedMatches: [],
    commands: {},
    coverageFileExtensions: [],
    depcheckConfig: {
      detectors: [
        depcheck.detector.importDeclaration,
        depcheck.detector.requireCallExpression,
        depcheck.detector.requireResolveCallExpression,
        depcheckDetectorExeca,
        depcheckDetectorPackageName,
      ],
      ignorePath: '.gitignore',
      parsers: {
        '**/*.js': depcheckParserBabel,
      },
      specials: [depcheckSpecialBaseConfig, depcheck.special.bin],
    },
    deployAssets: [],
    deployEnv: {},
    deployPlugins: [],
    editorIgnore: [],
    gitignore: [],
    lint: identity,
    nodeVersion: 14,
    preDeploySteps: [],
    prepare: identity,
    readmeInstallString: endent`
      ## Install

      \`\`\`bash
      # npm
      $ npm install ${rawConfig.global ? '-g ' : ''}${packageConfig.name}

      # Yarn
      $ yarn ${rawConfig.global ? 'global ' : ''}add ${packageConfig.name}
      \`\`\`
    `,
    seeAlso: [],
    syncKeywords: true,
  },
  inheritedConfig,
  rawConfig,
])
