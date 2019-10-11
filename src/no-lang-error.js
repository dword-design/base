module.exports = class extends Error {
  constructor() {
    super("The package does not include a language. Please install a package like 'base-lang-*'.")
  }
}
