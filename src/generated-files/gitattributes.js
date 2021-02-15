import { endent } from '@dword-design/functions'

export default endent`
  * text=auto eol=lf
  *.jpg filter=lfs diff=lfs merge=lfs -text
  *.png filter=lfs diff=lfs merge=lfs -text

`
