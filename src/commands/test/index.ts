import { Base } from '@/src';

declare module '@/src' {
  interface Base {
    test(options): void;
  }
}

Base.prototype.test = function (options) {
  return this.config.testInContainer
    ? this.testDocker(options)
    : this.testRaw(options);
}
