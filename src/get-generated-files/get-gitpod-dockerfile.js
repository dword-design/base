import { endent } from '@dword-design/functions'

export default function () {
  return endent`
    # Need to add :latest, otherwise old versions (e.g. of node) are installed
    FROM gitpod/workspace-full:2022-11-15-17-00-18
    
    RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
    RUN sudo apt-get install git-lfs
    RUN git lfs install
    
  `
}
