import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('valid', () =>
  expect(
    new Base({ gitignore: ['foo'] }).getGitignoreConfig(),
  ).toMatchSnapshot());
