import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from './..';

test('works', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(
    Object.keys(new Base(null, { cwd }).getGeneratedFiles()),
  ).toMatchSnapshot();
});
