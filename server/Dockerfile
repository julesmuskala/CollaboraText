FROM node:18

COPY package*.json ./

RUN npm install

ENV GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account-key.json"

COPY . .

EXPOSE 4000

RUN npm run build

CMD node --max-old-space-size=4096 ./dist/index.js
