import { execa } from 'execa';

export default function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  return execa('git-cz', [...(options.allowEmpty ? ['--allow-empty'] : [])], {
    cwd: this.cwd,
    ...(options.log && { stdout: 'inherit' }),
    stderr: options.stderr,
  });
}
