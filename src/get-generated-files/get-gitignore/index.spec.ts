import { expect, test } from '@playwright/test';

import { Base } from '@/src/index.js';

test('valid', () =>
  expect(
    new Base({ gitignore: ['foo'] }).getGitignoreConfig(),
  ).toMatchSnapshot());
