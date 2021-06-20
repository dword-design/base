"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  image: {
    file: '.gitpod.Dockerfile'
  },
  tasks: [{
    before: 'sudo docker-up',
    name: 'Docker Deamon'
  }, {
    init: 'eval $(gitpod-env-per-project) && git lfs pull && yarn --frozen-lockfile'
  }],
  vscode: {
    extensions: ['karlito40.fix-irregular-whitespace@0.0.3:8jjyZYuYF6yW6nwsAiulrg==', 'adrianwilczynski.toggle-hidden@1.0.2:pj4yxebPvdfdMeVIjOEuRQ==', 'octref.vetur@0.33.1']
  }
};
exports.default = _default;
module.exports = exports.default;