import { execa } from 'execa';
import parsePackagejsonName from 'parse-packagejson-name';

export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  const packageName = parsePackagejsonName(this.packageConfig.name).fullName;

  if (
    this.config.git !== undefined &&
    packageName !== this.config.git.project
  ) {
    throw new Error(
      `Package name '${packageName}' has to be equal to repository name '${this.config.git.project}'`,
    );
  }

  await this.config.lint.call(this, options);

  await execa('eslint', ['--fix', '.'], {
    ...(options.log && { stdout: 'inherit' }),
    cwd: this.cwd,
    stderr: options.stderr,
  });
}
