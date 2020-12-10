import { endent } from '@dword-design/functions'

export default endent`
  FROM gitpod/workspace-full

  RUN sudo apt-get update && sudo apt-get install -y libgtk-3-0 libx11-xcb1 libnss3 libxss1 libasound2 libgbm1
`
