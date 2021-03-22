import packageConfig from '@/src/package-config'

export default {
  ...packageConfig.name !== '@dword-design/base'
    && { ignorePaths: ['.github/workflows/build.yml'] },
  "extends": [
    ":semanticCommits"
  ],
  "labels": [
    "maintenance"
  ],
  "semanticCommitScope": null,
  "packageRules": [
    {
      "packagePatterns": [
        "*"
      ],
      "semanticCommitType": "chore"
    },
    {
      "depTypeList": [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies"
      ],
      "semanticCommitType": "fix"
    }
  ],
  "lockFileMaintenance": {
    "enabled": true
  }
}
