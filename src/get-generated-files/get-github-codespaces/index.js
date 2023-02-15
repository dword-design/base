export default function () {
  return {
    name: 'Node.js',
    image: 'mcr.microsoft.com/devcontainers/universal:2',
    onCreateCommand: 'echo foo',
  }
}
