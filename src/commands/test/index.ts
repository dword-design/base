import type { PartialTestOptions } from '@/src/commands/partial-test-options';
import { Base } from '@/src';

export default function (this: Base, options?: PartialTestOptions) {
  return this.config.testInContainer
    ? this.testDocker(options)
    : this.testRaw(options);
}
