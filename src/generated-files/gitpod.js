export default {
  image: { file: '.gitpod.Dockerfile' },
  tasks: [
    { before: 'sudo docker-up', name: 'Docker' },
    {
      init: 'git lfs pull && yarn --frozen-lockfile',
      name: 'Init',
    },
    {
      command: 'eval $(gitpod-env-per-project)',
      name: 'Env',
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
