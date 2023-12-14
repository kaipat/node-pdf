ARG NODE_VERSION=node:lts-bullseye-slim

FROM ${NODE_VERSION}

WORKDIR /app

COPY package.json .

RUN yarn config set registry https://registry.npm.taobao.org
RUN yarn

COPY . .

CMD npm start
