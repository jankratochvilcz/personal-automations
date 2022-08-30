FROM node:18-alpine AS BUILD_IMAGE

WORKDIR /usr/src/app

COPY . .

RUN npm config set cache /tmp --global

# The rimraf node_modules is run before npm ci as otherwise NPM throws a WARN about it

RUN npm install rimraf -g && \
    rimraf ['node_modules']

RUN npm ci

EXPOSE 3000
EXPOSE 8080

CMD ["npm", "run", "start:prod"]