import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('works', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(
    Object.keys(new Base(null, { cwd }).getGeneratedFiles()),
  ).toMatchSnapshot();
});
