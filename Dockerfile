FROM node:latest

COPY package.json yarn.lock /
RUN yarn -s --no-cache --frozen-lockfile
COPY . /

ENTRYPOINT ["yarn", "start"]
