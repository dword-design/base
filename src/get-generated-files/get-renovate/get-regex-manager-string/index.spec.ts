import self from './index.js';
import { test, expect } from '@playwright/test';

test('code before', () =>
  expect(
    new RegExp(self('foo', '(?<currentValue>.*?)')).test(
      "console.log('foo');foo`18`",
    ),
  ).toEqual(true)
);

test('default', () =>
  expect(
    new RegExp(self('foo', '(?<currentValue>.*?)')).test('foo`18`'),
  ).toEqual(true)
);

test('letters before', () =>
  expect(
    new RegExp(self('foo', '(?<currentValue>.*?)')).test('xyzfoo`18`'),
  ).toEqual(false),
);
