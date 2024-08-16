import { Base } from '@/src/index.js';

export default {
  valid() {
    expect(
      new Base({ gitignore: ['foo'] }).getGitignoreConfig(),
    ).toMatchSnapshot(this);
  },
};
