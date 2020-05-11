import { endent } from '@dword-design/functions'

export default endent`
  {
    "extends": [
      ":semanticCommits"
    ],
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
      "enabled": true,
      "schedule": "at any time"
    }
  }
  
`
