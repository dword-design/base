"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _endent.default)`
  # Need to add :latest, otherwise old versions (e.g. of node) are installed
  FROM gitpod/workspace-full:latest

  RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
  RUN sudo apt-get install git-lfs
  RUN git lfs install
  RUN echo "\\nexport PATH=$(yarn global bin):\\$PATH" >> /home/gitpod/.bashrc
  RUN yarn global add gitpod-env-per-project @babel/node
  RUN sudo apt-get install -y graphviz
  RUN brew install gh

  # Puppeteer dependencies
  RUN sudo apt-get update && sudo apt-get install -y libgtk-3-0 libx11-xcb1 libnss3 libxss1 libasound2 libgbm1 libxshmfence1
  
`;

exports.default = _default;
module.exports = exports.default;