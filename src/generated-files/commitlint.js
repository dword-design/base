import packageName from 'depcheck-package-name'

export default {
  extends: [packageName`@commitlint/config-conventional`],
  rules: {
    'footer-max-line-length': [0],
  },
}
