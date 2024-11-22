FROM node:20.16.0
WORKDIR /admin-frontend
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
