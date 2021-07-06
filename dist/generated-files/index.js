"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _add = _interopRequireDefault(require("@dword-design/functions/dist/add"));

var _join = _interopRequireDefault(require("@dword-design/functions/dist/join"));

var _jsonToString = _interopRequireDefault(require("@dword-design/functions/dist/json-to-string"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _sortKeys7 = _interopRequireDefault(require("sort-keys"));

var _sortPackageJson = _interopRequireDefault(require("sort-package-json"));

var _yaml = _interopRequireDefault(require("yaml"));

var _babel = _interopRequireDefault(require("./babel"));

var _commitizen = _interopRequireDefault(require("./commitizen"));

var _commitlint = _interopRequireDefault(require("./commitlint"));

var _editorconfig = _interopRequireDefault(require("./editorconfig"));

var _eslint = _interopRequireDefault(require("./eslint"));

var _gitattributes = _interopRequireDefault(require("./gitattributes"));

var _githubDeprecatedDependencies = _interopRequireDefault(require("./github-deprecated-dependencies"));

var _githubDeprecatedDependenciesIssueTemplate = _interopRequireDefault(require("./github-deprecated-dependencies-issue-template"));

var _githubFunding2 = _interopRequireDefault(require("./github-funding"));

var _githubLabels = _interopRequireDefault(require("./github-labels"));

var _githubSyncLabels = _interopRequireDefault(require("./github-sync-labels"));

var _githubSyncMetadata = _interopRequireDefault(require("./github-sync-metadata"));

var _githubWorkflow = _interopRequireDefault(require("./github-workflow"));

var _gitignore = _interopRequireDefault(require("./gitignore"));

var _gitpod = _interopRequireDefault(require("./gitpod"));

var _gitpodDockerfile = _interopRequireDefault(require("./gitpod-dockerfile"));

var _licenseString = _interopRequireDefault(require("./license-string"));

var _packageConfig2 = _interopRequireDefault(require("./package-config"));

var _readmeString = _interopRequireDefault(require("./readme-string"));

var _release = _interopRequireDefault(require("./release"));

var _renovate = _interopRequireDefault(require("./renovate"));

var _vscode = _interopRequireDefault(require("./vscode"));

var _babelConfig, _commitlintConfig, _eslintConfig, _githubFunding, _sortKeys, _sortKeys2, _sortKeys3, _sortKeys4, _sortKeys5, _ref, _gitignoreConfig, _gitpodConfig, _releaseConfig, _sortKeys6, _vscodeConfig, _ref2, _ref3, _packageConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  '.babelrc.json': (_babelConfig = _babel.default, (0, _jsonToString.default)({
    indent: 2
  })(_babelConfig)),
  '.commitlintrc.json': (_commitlintConfig = _commitlint.default, (0, _jsonToString.default)({
    indent: 2
  })(_commitlintConfig)),
  '.cz.json': _commitizen.default,
  '.editorconfig': _editorconfig.default,
  '.eslintrc.json': `${(_eslintConfig = _eslint.default, (0, _jsonToString.default)({
    indent: 2
  })(_eslintConfig))}\n`,
  '.gitattributes': _gitattributes.default,
  '.github/DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md': _githubDeprecatedDependenciesIssueTemplate.default,
  '.github/FUNDING.yml': (_githubFunding = _githubFunding2.default, _yaml.default.stringify(_githubFunding)),
  '.github/labels.yml': (_sortKeys = (0, _sortKeys7.default)(_githubLabels.default, {
    deep: true
  }), _yaml.default.stringify(_sortKeys)),
  '.github/workflows/build.yml': (_sortKeys2 = (0, _sortKeys7.default)(_githubWorkflow.default, {
    deep: true
  }), _yaml.default.stringify(_sortKeys2)),
  '.github/workflows/deprecated-dependencies.yml': (_sortKeys3 = (0, _sortKeys7.default)(_githubDeprecatedDependencies.default, {
    deep: true
  }), _yaml.default.stringify(_sortKeys3)),
  '.github/workflows/sync-labels.yml': (_sortKeys4 = (0, _sortKeys7.default)(_githubSyncLabels.default, {
    deep: true
  }), _yaml.default.stringify(_sortKeys4)),
  '.github/workflows/sync-metadata.yml': (_sortKeys5 = (0, _sortKeys7.default)(_githubSyncMetadata.default, {
    deep: true
  }), _yaml.default.stringify(_sortKeys5)),
  '.gitignore': (_ref = (_gitignoreConfig = _gitignore.default, (0, _map.default)(entry => `${entry}\n`)(_gitignoreConfig)), (0, _join.default)('')(_ref)),
  '.gitpod.Dockerfile': _gitpodDockerfile.default,
  '.gitpod.yml': (_gitpodConfig = _gitpod.default, _yaml.default.stringify(_gitpodConfig)),
  '.releaserc.json': (_releaseConfig = _release.default, (0, _jsonToString.default)({
    indent: 2
  })(_releaseConfig)),
  '.renovaterc.json': (_sortKeys6 = (0, _sortKeys7.default)(_renovate.default, {
    deep: true
  }), (0, _jsonToString.default)({
    indent: 2
  })(_sortKeys6)),
  '.vscode/settings.json': (_vscodeConfig = _vscode.default, (0, _jsonToString.default)({
    indent: 2
  })(_vscodeConfig)),
  'LICENSE.md': _licenseString.default,
  'README.md': _readmeString.default,
  'package.json': (_ref2 = (_ref3 = (_packageConfig = _packageConfig2.default, (0, _sortPackageJson.default)(_packageConfig)), (0, _jsonToString.default)({
    indent: 2
  })(_ref3)), (0, _add.default)('\n')(_ref2))
};
exports.default = _default;
module.exports = exports.default;