module.exports = class extends Error {
  constructor() {
    super("The package does not include a target. Please install a package like 'base-target-*'.")
  }
}
