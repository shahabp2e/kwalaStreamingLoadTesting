FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY . .

EXPOSE ${SERVICE_PORT}

CMD ["node", "server.js"]
