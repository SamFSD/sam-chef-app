FROM node:lts-alpine as base

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN npm install -g @angular/cli

WORKDIR /home/node/app

COPY --chown=node:node ./app .

RUN mkdir -p /home/node/app/.angular && chmod -R 777 /home/node/app/.angular

USER node

CMD ["yarn", "start", "--host", "0.0.0.0", "--disable-host-check"]
