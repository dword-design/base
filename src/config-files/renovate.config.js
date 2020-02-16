import { endent } from '@dword-design/functions'

export default endent`
  {
    "extends": [
      ":semanticCommits",
      ":semanticCommitType(fix)"
    ],
    "lockFileMaintenance": {
      "enabled": true,
      "schedule": "at any time"
    }
  }
  
`