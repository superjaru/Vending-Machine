FROM node:22-alpine
RUN apk --no-cache add git curl
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 8080

CMD node dist/src/index.js