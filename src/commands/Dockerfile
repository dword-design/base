FROM dworddesign/testing:latest

ARG user

USER root

RUN touch /.yarnrc
RUN mkdir -p /.yarn
RUN mkdir -p /.cache/yarn
RUN mkdir -p /app/node_modules

RUN chown $user /.yarnrc
RUN chown $user /.yarn
RUN chown $user /.cache/yarn
RUN chown $user /app/node_modules

# alekzonder/puppeteer
# RUN chown -R $user /home/pptruser
# RUN chown -R $user /usr/local/share/.config/yarn/global/node_modules
# RUN chown -R $user /screenshots
# RUN chown -R $user /app
# RUN chown -R $user /tools
  
USER $user
