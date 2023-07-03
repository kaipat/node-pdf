ARG NODE_VERSION=node:lts-bullseye-slim

FROM ${NODE_VERSION}

WORKDIR /app

COPY package.json .

RUN yarn

COPY . .

CMD npm start
