"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _filter = _interopRequireDefault(require("@dword-design/functions/dist/filter"));

var _flatMap = _interopRequireDefault(require("@dword-design/functions/dist/flat-map"));

var _includes = _interopRequireDefault(require("@dword-design/functions/dist/includes"));

var _join = _interopRequireDefault(require("@dword-design/functions/dist/join"));

var _depcheckPackageName = _interopRequireDefault(require("depcheck-package-name"));

var _execa = _interopRequireDefault(require("execa"));

var _getProjectzReadmeSectionRegex = _interopRequireDefault(require("get-projectz-readme-section-regex"));

var _isCi = _interopRequireDefault(require("is-ci"));

var _safeReadfile = require("safe-readfile");

var _stdEnv = _interopRequireDefault(require("std-env"));

var _lint = _interopRequireDefault(require("../lint"));

var _config = _interopRequireDefault(require("../../config"));

var _depcheck = _interopRequireDefault(require("./depcheck"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = async (pattern, options) => {
  var _ref2, _config$coverageFileE;

  options = {
    log: !_stdEnv.default.test,
    ...options
  };

  if (!pattern) {
    var _ref;

    try {
      await (0, _execa.default)('ajv', ['-s', require.resolve("./package-json-schema"), '-d', 'package.json', '--allow-union-types', '--errors', 'text'], {
        all: true
      });
    } catch (error) {
      throw new Error(error.all);
    }

    const readmeContent = (0, _safeReadfile.readFileSync)('README.md', 'utf8') || '';
    const missingReadmeSections = (_ref = ['TITLE', 'BADGES', 'DESCRIPTION', 'INSTALL', 'LICENSE'], (0, _filter.default)(sectionName => !(0, _getProjectzReadmeSectionRegex.default)(sectionName).test(readmeContent))(_ref));

    if (missingReadmeSections.length > 0) {
      var _missingReadmeSection;

      throw new Error(`The README.md file is missing or misses the following sections: ${(_missingReadmeSection = missingReadmeSections, (0, _join.default)(', ')(_missingReadmeSection))}`);
    }

    await (0, _lint.default)();
    await (0, _depcheck.default)();
  }

  const runDockerTests = !_isCi.default || !(_ref2 = ['win32', 'darwin'], (0, _includes.default)(process.platform)(_ref2));
  return (0, _execa.default)('nyc', ['--reporter', 'lcov', '--reporter', 'text', '--cwd', process.cwd(), '--require', require.resolve("./pretest"), '--all', ...(_config$coverageFileE = _config.default.coverageFileExtensions, (0, _flatMap.default)(extension => ['--extension', extension])(_config$coverageFileE)), '--exclude', '**/*.spec.js', '--exclude', 'coverage', '--exclude', 'tmp-*', '--exclude', 'dist', 'mocha', '--ui', (0, _depcheckPackageName.default)`mocha-ui-exports-auto-describe`, ...(runDockerTests ? [] : ['--ignore', '**/*.usesdocker.spec.js']), '--file', require.resolve("./setup-test"), '--timeout', 80000, ...(options.grep ? ['--grep', options.grep] : []), ...(process.platform === 'win32' ? ['--exit'] : []), pattern || '{,!(node_modules)/**/}*.spec.js'], {
    env: {
      NODE_ENV: 'test',
      ...(options.updateSnapshots && {
        SNAPSHOT_UPDATE: 1
      })
    },
    ...(options.log ? {
      stdio: 'inherit'
    } : {
      all: true
    })
  });
};

exports.default = _default;
module.exports = exports.default;