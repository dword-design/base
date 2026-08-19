import { expectTypeOf } from 'expect-type';
import { test, expect } from '@playwright/test';
import self from '.'

test('works', () => {
  expect(self({ bar: 1, foo: 2 })).toEqual(['bar', 'foo']);
  expectTypeOf(self({ bar: 1, foo: 2 })).toEqualTypeOf<['bar', 'foo']>();
});
