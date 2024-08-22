# specify the node base image with your desired version node:<version>
FROM node:lts-alpine as base

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

ENV PATH=$PATH:/home/node/.npm-global/bin

RUN npm install -g @angular/cli


WORKDIR /home/node/app

COPY --chown=node ./app .

# RUN yarn set version stable
# RUN yarn install

USER node

CMD yarn start --host 0.0.0.0

