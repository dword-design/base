export default {
  image: { file: '.gitpod.Dockerfile' },
  tasks: [
    {
      init: 'git lfs pull && yarn --frozen-lockfile && sudo docker-up',
      name: 'Docker',
    },
    { command: 'eval $(gitpod-env-per-project)' },
  ],
  vscode: {
    extensions: [
      'https://sebastianlandwehr.com/vscode-extensions/karlito40.fix-irregular-whitespace-0.1.1.vsix',
      'https://sebastianlandwehr.com/vscode-extensions/adrianwilczynski.toggle-hidden-1.0.2.vsix',
      'octref.vetur@0.33.1',
    ],
  },
}
