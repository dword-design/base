import { Base } from '@/src';
Base.prototype.test = function (options) {
    return this.config.testInContainer
        ? this.testDocker(options)
        : this.testRaw(options);
};
