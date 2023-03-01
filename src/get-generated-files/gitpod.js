import * as personalData from '@dword-design/personal-data'
import P from 'path'

export default {
  image: { file: '.gitpod.Dockerfile' },
  tasks: [
    {
      // puppeteer by default installs Chromium in the home folder, but since GitPod does not preserve the home folder
      // after restarts, we need to store it in the workspace folder
      // https://www.gitpod.io/docs/configure/workspaces/workspace-lifecycle#workspace-stopped
      before: `cat "PUPPETEER_CACHE_DIR=${P.resolve('node_modules', '.cache', 'puppeteer')}" >> ~/.bashrc`,
      command: 'eval $(gitpod-env-per-project)',
      init: `git config --global user.name "${personalData.name}" && git lfs pull && yarn --frozen-lockfile`,
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
