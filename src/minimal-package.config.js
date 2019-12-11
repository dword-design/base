export default {
  name: 'foo',
  version: '1.0.0',
  description: 'This is a test package.',
  bugs: {
    url: 'https://github.com/dword-design/base/issues',
  },
  repository: 'bar/foo',
  license: 'MIT',
  author: 'bar',
  files: [
    'dist',
  ],
  main: 'dist/index.js',
  scripts: {
    prepublishOnly: 'base build',
    start: 'base start',
    test: 'base test',
  },
  contributors: [
    'dword-design (http://www.dword-design.de)',
    'Renovate Bot (http://renovatebot.com)',
  ],
  maintainers: [],
}
