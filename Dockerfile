FROM node:carbon-alpine

RUN apk --no-cache add --virtual .builds-deps build-base python2

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
