import { endent, identity } from '@dword-design/functions'
import deepmerge from 'deepmerge'
import depcheck from 'depcheck'
import depcheckDetectorExeca from 'depcheck-detector-execa'
import depcheckDetectorPackageName from 'depcheck-detector-package-name'
import depcheckParserBabel from 'depcheck-parser-babel'
import importCwd from 'import-cwd'

import getDepcheckSpecialBase from '@/src/get-depcheck-special-base'
import getPackageConfig from '@/src/get-package-config'
import getRawConfig from '@/src/get-raw-config'
import getGitInfo from '@/src/get-git-info'
import getGeneratedFiles from '@/src/get-generated-files'

export default async () => {
  const rawConfig = await getRawConfig()
  const packageConfig = await getPackageConfig()
  let defaultConfig = {
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
      specials: [getDepcheckSpecialBase(rawConfig), depcheck.special.bin],
    },
    deployAssets: [],
    deployEnv: {},
    deployPlugins: [],
    editorIgnore: [],
    gitignore: [],
    lint: identity,
    nodeVersion: 16,
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
    supportedNodeVersions: [14, 16, 18],
    syncKeywords: true,
    package: packageConfig,
    git: await getGitInfo(),
  }
  let inheritedConfig =
    importCwd.silent(rawConfig.name) || require(rawConfig.name)

  const mergeOptions = {
    customMerge: key =>
      key === 'supportedNodeVersions' ? (a, b) => b : undefined,
  }
  if (typeof inheritedConfig === 'function') {
    inheritedConfig = inheritedConfig(
      deepmerge(defaultConfig, rawConfig, mergeOptions)
    )
  }

  const finalConfig = deepmerge.all(
    [defaultConfig, inheritedConfig, rawConfig],
    mergeOptions
  )
  finalConfig.generatedFiles = getGeneratedFiles(finalConfig)
  return finalConfig
}