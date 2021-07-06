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
    extensions: ['https://sebastianlandwehr.com/vscode-extensions/karlito40.fix-irregular-whitespace-0.1.1.vsix', 'https://sebastianlandwehr.com/vscode-extensions/adrianwilczynski.toggle-hidden-1.0.2.vsix', 'octref.vetur@0.33.1']
  }
};
exports.default = _default;
module.exports = exports.default;