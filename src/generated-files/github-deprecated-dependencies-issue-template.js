import { endent } from '@dword-design/functions'

export default endent`
  ---
  title: Deprecated dependencies
  labels: maintenance
  ---
  There are deprecated dependencies. See workflow run for details.
  {{ steps.check-deprecated-js-deps.outputs.deprecated }}
  
`