import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

test('valid', () =>
  expect(
    new Base({ editorIgnore: ['bar', 'foo'] }).getVscodeConfig(),
  ).toMatchSnapshot());
