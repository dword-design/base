import { Base } from '@/src/index.js';

export default {
  works() {
    const base = new Base({ nodeVersion: 18 });
    expect(base.getGithubCodespacesConfig()).toMatchSnapshot(this);
  },
};
