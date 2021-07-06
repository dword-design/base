"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _endent.default)`
  ---
  title: Deprecated dependencies
  labels: maintenance
  ---
  The following dependencies are deprecated:

  {% for dependency in env.DEPRECATED.split(',') %}
    - **{{ dependency }}**
  {% endfor %}

  Check out the [build]({{ env.RUN_URL }}) for details.
  
`;

exports.default = _default;
module.exports = exports.default;