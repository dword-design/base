import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

import self from '.';

test('works', ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  expect(Object.keys(self(new Base(null, { cwd })))).toMatchSnapshot();
});
