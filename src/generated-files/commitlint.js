import packageName from 'depcheck-package-name'

export default {
  extends: [packageName`@commitlint/config-conventional`],
  rules: {
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
