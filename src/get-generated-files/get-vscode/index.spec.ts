import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';
import self from '.'

test('valid', () =>
  expect(
    self(new Base({ editorIgnore: ['bar', 'foo'] })),
  ).toMatchSnapshot());
