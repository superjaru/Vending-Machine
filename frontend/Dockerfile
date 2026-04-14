FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_PUBLIC_MACHINE_SERIAL=TEST-CW-001

RUN npm run build

RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]