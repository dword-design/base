export default {
  name: 'Node.js',
  build: { dockerfile: 'Dockerfile' },
  updateContentCommand: 'yarn --frozen-lockfile',
}
