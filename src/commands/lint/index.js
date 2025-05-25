import { execa } from 'execa';
import parsePackagejsonName from 'parse-packagejson-name';

export default async function () {
  const packageName = parsePackagejsonName(this.packageConfig.name).fullName;

  if (
    this.config.git !== undefined &&
    packageName !== this.config.git.project
  ) {
    throw new Error(
      `Package name '${packageName}' has to be equal to repository name '${this.config.git.project}'`,
    );
  }
  await this.config.lint.call(this);
  try {
    await execa('eslint', ['--fix', '.'], { all: true });
  } catch (error) {
    throw new Error(error.all);
  }
}
