import { expect, test } from '@playwright/test';

import { Base } from './..';

test('works', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(
    JSON.stringify(
      Object.keys(new Base(null, { cwd }).getGeneratedFiles()),
      undefined,
      2,
    ),
  ).toMatchSnapshot();
});
