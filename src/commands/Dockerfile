# FROM node:lts-slim

# ARG user


# RUN apt-get update

# # Puppeteer
# RUN apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
# libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
# libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
# libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
# fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
# ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && \
# wget https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64.deb && \
# dpkg -i dumb-init_*.deb && rm -f dumb-init_*.deb && \
# apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# RUN apt-get update

# # X Server
# RUN apt-get install -y xvfb

# # dot
# RUN apt-get install -y git graphviz

# # tree-kill-promise
# RUN apt-get install -y procps

# RUN touch /.yarnrc
# RUN mkdir -p /.cache/yarn
# RUN mkdir -p /app/node_modules

# RUN chown $user /.yarnrc
# RUN chown $user /.cache/yarn
# RUN chown $user /app/node_modules

# USER $user

# WORKDIR /app

# ARG user

# FROM dworddesign/alekzonder-puppeteer:latest

# USER root

# RUN apt-get update

# # Puppeteer
# RUN apt-get install -y xvfb

# # dot
# RUN apt-get install -y git graphviz

# # tree-kill-promise
# RUN apt-get install -y procps

# RUN chown $user /app

# USER $user

ARG user

FROM dworddesign/testing:latest

USER $user