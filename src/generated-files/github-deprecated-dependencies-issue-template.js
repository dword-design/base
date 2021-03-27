import { endent } from '@dword-design/functions'

export default endent`
  ---
  title: Deprecated dependencies
  labels: maintenance
  ---
  The following dependencies are deprecated:

  {% for dependency in env.DEPRECATED.split(',') %}
    <li>{{ dependency }}</li>
  {% endfor %}
  
`