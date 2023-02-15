import { endent } from '@dword-design/functions'

export default function () {
  return endent`
    # Need to add :latest, otherwise old versions (e.g. of node) are installed
    FROM gitpod/workspace-full:latest

    RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
    RUN sudo apt-get install git-lfs
    RUN git lfs install

    # https://www.gitpod.io/docs/languages/javascript
    RUN source $HOME/.nvm/nvm.sh
    RUN nvm install ${this.config.nodeVersion}
    RUN nvm use ${this.config.nodeVersion}
    RUN nvm alias default ${this.config.nodeVersion}
    RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

    RUN echo "\\nexport PATH=$(yarn global bin):\\$PATH" >> /home/gitpod/.bashrc

    RUN yarn global add gitpod-env-per-project @babel/node @babel/core

    RUN sudo apt-get install -y graphviz
    
    RUN brew install gh

    # Puppeteer dependencies
    RUN sudo apt-get update && sudo apt-get install -y libgtk-3-0 libx11-xcb1 libnss3 libxss1 libasound2 libgbm1 libxshmfence1
    
  `
}
