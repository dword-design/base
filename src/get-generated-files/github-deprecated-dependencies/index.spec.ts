import self from './index.js';

export default {
  valid() {
    expect(self).toMatchSnapshot(this);
  },
};
