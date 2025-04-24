FROM node:22.15.0
WORKDIR /admin-frontend
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
