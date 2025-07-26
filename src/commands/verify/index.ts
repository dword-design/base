export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    patterns: [],
    stderr: 'inherit',
    ...options,
  };

  await this.lint(options);
  await this.typecheck(options);
  await this.depcheck();
  await this.test(options);
  await this.checkUnknownFiles();
}
