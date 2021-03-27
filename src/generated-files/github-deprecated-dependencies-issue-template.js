import { endent } from '@dword-design/functions'

export default endent`
  ---
  title: Deprecated dependencies
  labels: maintenance
  ---
  There are deprecated dependencies. See workflow run for details.
  {{ tools.outputs.check-deprecated-js-deps.deprecated }}
  
`