import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

test('valid', () =>
  expect(
    new Base({ gitignore: ['foo'] }).getGitignoreConfig(),
  ).toMatchSnapshot());
