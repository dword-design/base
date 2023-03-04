import { endent } from '@dword-design/functions'
import * as personalData from '@dword-design/personal-data'

export default function () {
  return {
    image: { file: '.gitpod.Dockerfile' },
    tasks: [
      {
        // puppeteer by default installs Chromium in the home folder, but since GitPod does not preserve the home folder
        // after restarts, we need to store it in the workspace folder
        // https://www.gitpod.io/docs/configure/workspaces/workspace-lifecycle#workspace-stopped
        before: endent`
          echo "export PUPPETEER_CACHE_DIR=/workspace/${this.config.git.project}/node_modules/.cache/puppeteer" >> /home/gitpod/.bashrc
          echo "eval $(gitpod-env-per-project)" >> /home/gitpod/.bashrc && source /home/gitpod/.bashrc
        `,
        init: endent`
          git config --global user.name "${personalData.name}"
          git lfs pull && yarn --frozen-lockfile
        `,
      },
    ],
    vscode: {
      extensions: [
        'https://sebastianlandwehr.com/vscode-extensions/karlito40.fix-irregular-whitespace-0.1.1.vsix',
        'https://sebastianlandwehr.com/vscode-extensions/adrianwilczynski.toggle-hidden-1.0.2.vsix',
        'octref.vetur@0.33.1',
      ],
    },
  }
}
