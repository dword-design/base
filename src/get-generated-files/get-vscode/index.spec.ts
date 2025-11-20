import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

test('valid', () =>
  expect(
    JSON.stringify(
      new Base({ editorIgnore: ['bar', 'foo'] }).getVscodeConfig(),
      undefined,
      2,
    ),
  ).toMatchSnapshot());
