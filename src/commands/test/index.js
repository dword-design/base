export default function (options) {
  return this.config.testInContainer
    ? this.testDocker(options)
    : this.testRaw(options)
}
